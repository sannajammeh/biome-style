import { describe, expect, test } from 'bun:test';
import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { generateBundle } from '../../scripts/build-bundle.ts';
import { PLUGINS_DIR, fixtureFor, runBundle, runPlugin } from './harness.ts';

/** Materialise the generated bundle to a temp `all.grit` and return its path. */
function writeBundle(): string {
  const dir = mkdtempSync(join(tmpdir(), 'biome-style-bundle-'));
  const path = join(dir, 'all.grit');
  writeFileSync(path, generateBundle(PLUGINS_DIR));
  return path;
}

/** Every granular rule that ships a `.grit` plugin (glob-based, no manifest). */
function discoverRules(): string[] {
  return readdirSync(PLUGINS_DIR)
    .filter((name) => name.endsWith('.grit') && name !== 'all.grit')
    .map((name) => name.replace(/\.grit$/, ''))
    .sort();
}

// One bundle for the whole suite — the exact bytes a consumer would publish.
const BUNDLE_PATH = writeBundle();
const RULES = discoverRules();

// Rules whose EVERY invalid-fixture violation site is also matched by an
// alphabetically-earlier rule. The bundle's single top-level `or { }`
// short-circuits on first match (ADR-0003), so at those co-matched nodes the
// earlier branch's diagnostic is emitted and this rule's own message never
// surfaces. The node is still flagged — coverage is intact — there is simply no
// non-overlapping site where the subsumed rule could show its own message
// (unlike the ADR's `prefer-function-declaration`, which still fires on its
// arrow site). For these we assert the weaker, honest contract: ≥1 diagnostic
// fires on the fixture (the violation is covered), not the own-message check.
//
//   - no-new-require: `new require(...)` is necessarily `new <lowercase>(...)`,
//     which `new-cap` (earlier) matches at every site — total subsumption.
//
// The rule keeps standalone value in granular/cherry-pick mode (precise message,
// usable without `new-cap`); only the all-in-one bundle subsumes it.
const BUNDLE_SUBSUMED = new Set(['no-new-require']);

describe('plugin bundle', () => {
  test('discovers every granular rule', () => {
    expect(RULES.length).toBeGreaterThan(0);
  });

  // Invalid-side equivalence (per-rule LIVENESS, the contract ADR-0003 defines):
  // each rule, once wrapped into the single `or { }`, must still fire its own
  // diagnostic on its `invalid.js`. We take the rule's message vocabulary from
  // the CLI (its granular run) rather than parsing the grit source — GritQL's
  // string-escape handling diverges from the literal, so the CLI is the only
  // ground truth — then assert the bundle emits ≥1 diagnostic bearing one of
  // those messages. This catches metavariable collisions, comment breakage, and
  // compile failures introduced by a new rule.
  //
  // Deliberately NOT a per-node subset check: `or { }` short-circuits on first
  // match, so at a node matched by several rules only the alphabetically-first
  // branch fires. The bundle therefore proves each rule is live, not that it
  // reproduces every diagnostic the separately-loaded granular plugins would.
  test.each(RULES)('%s fires through the bundle', async (rule) => {
    const granular = await runPlugin(rule, 'invalid');
    // The invalid fixture must trip its own rule in isolation, or there is no
    // message to look for through the bundle.
    expect(granular.length).toBeGreaterThanOrEqual(1);

    const bundled = runBundle(BUNDLE_PATH, fixtureFor(rule, 'invalid'));

    if (BUNDLE_SUBSUMED.has(rule)) {
      // Own message is unreachable through the bundle (see BUNDLE_SUBSUMED), but
      // the violation site must still be flagged by the subsuming rule.
      expect(bundled.length).toBeGreaterThanOrEqual(1);
      return;
    }

    const ownMessages = new Set(granular.map((diagnostic) => diagnostic.message));
    expect(
      bundled.some((diagnostic) => ownMessages.has(diagnostic.message)),
    ).toBe(true);
  });
});
