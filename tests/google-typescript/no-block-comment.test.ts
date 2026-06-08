import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-block-comment';

/**
 * UNENFORCEABLE in Biome 2.4.16 — comment-blindness.
 *
 * This rule would flag multi-line `/* ... *​/` block comments used as
 * implementation comments while allowing JSDoc `/** ... *​/`. It cannot be
 * expressed as a GritQL plugin: in Biome 2.4.16 the plugin engine treats
 * comments as invisible trivia.
 *
 * Verified against the real CLI (the only ground truth — see
 * docs/agents/gritql-plugins.md):
 *   - Comment node kinds all FAIL TO COMPILE: `comment()`, `multiline_comment()`,
 *     `js_comment()`, `block_comment()`, `trivia()` each produce
 *     "Failed to compile the Grit plugin".
 *   - A backtick comment snippet `` `/* $msg *​/` `` COMPILES but matches NOTHING
 *     (0 diagnostics) — the engine never visits comment nodes.
 *
 * This is the same comment-blindness that forced `no-triple-slash-reference`
 * to be classified `unenforceable` (COVERAGE.md): triple-slash directives are
 * also comment trivia. No `.grit` plugin file is shipped for this rule (we do
 * not ship no-op plugins).
 *
 * The fixtures (fixtures/no-block-comment/{valid,invalid}.ts) are kept so the
 * evidence is reproducible: re-enable the suite below and run `bun test` to
 * confirm that any future comment-capable Biome version would let a plugin
 * flag invalid.ts (>= 1 diagnostic) while staying silent on valid.ts.
 */
describe.skip(RULE, () => {
  test('would stay silent on line comments and JSDoc', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('would flag `/* ... */` implementation block comments', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(1);
  });
});
