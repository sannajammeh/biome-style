import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-jsdoc-types';

/**
 * UNENFORCEABLE in Biome 2.4.16 — comment-blindness.
 *
 * This rule would flag redundant type-bearing JSDoc tags in TypeScript —
 * `@param {type}`, `@returns {type}`, `@implements`, `@enum`, `@private`,
 * `@override` — which the type system / `private`/`override` keywords make
 * redundant, while staying silent on type-free JSDoc (`@param name desc`) and
 * ordinary prose comments. It cannot be expressed as a GritQL plugin: in
 * Biome 2.4.16 the plugin engine treats JSDoc (like all comments) as invisible
 * trivia, so there is no node to match and no comment text to inspect.
 *
 * Verified against the real CLI (the only ground truth — see
 * docs/agents/gritql-plugins.md):
 *   - Comment/JSDoc node kinds all FAIL TO COMPILE ("Failed to compile the
 *     Grit plugin", exit 1): `comment()`, `js_comment()`, `multiline_comment()`,
 *     `Jsdoc()`, `trivia()`.
 *   - A backtick JSDoc snippet `` `/** @param {$type} $name *​/` `` COMPILES but
 *     matches NOTHING (0 plugin diagnostics) — the engine never visits comment
 *     nodes. A bare `` `@param` `` snippet and a regex `` r"@param" `` likewise
 *     compile but yield 0 diagnostics, even against an `invalid.ts` full of
 *     `@param {number}` JSDoc.
 *
 * This is the same comment-blindness that forced `no-triple-slash-reference`
 * (#1/#9), `no-ts-suppression-comments` (#13), and `no-block-comment` (#15) to
 * be classified `unenforceable` in COVERAGE.md. No `.grit` plugin file is
 * shipped for this rule (we do not ship no-op plugins).
 *
 * The fixtures (fixtures/no-jsdoc-types/{valid,invalid}.ts) are kept so the
 * evidence is reproducible: re-enable the suite below and run `bun test` to
 * confirm that any future comment-capable Biome version would let a plugin
 * flag invalid.ts (>= 1 diagnostic) while staying silent on valid.ts.
 */
describe.skip(RULE, () => {
  test('would stay silent on type-free JSDoc and prose comments', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('would flag type-bearing JSDoc tags (@param {type}, @override, ...)', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(1);
  });
});
