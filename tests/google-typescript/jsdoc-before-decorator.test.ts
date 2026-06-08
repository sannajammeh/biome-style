import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'jsdoc-before-decorator';

/**
 * UNENFORCEABLE in Biome 2.4.16 — comment-blindness.
 *
 * This rule would flag JSDoc positioned between a decorator and its symbol
 * (documentation goes before the decorator, not between), staying silent when
 * the JSDoc precedes the decorator. It cannot be expressed as a GritQL plugin:
 * JSDoc is a comment, and in Biome 2.4.16 the plugin engine treats comments as
 * invisible trivia — there is no node to match and no comment text to inspect,
 * so the "between" and "before" placements are indistinguishable to the engine.
 *
 * Verified against the real CLI (the only ground truth — see
 * docs/agents/gritql-plugins.md), against a fixture with JSDoc between the
 * decorator and the class:
 *   - Comment node kinds all FAIL TO COMPILE ("Failed to compile the Grit
 *     plugin", exit 1): `comment()`, `js_comment()`, `JsComment()`.
 *   - A JSDoc snippet `` `/** doc *​/` `` and a regex `` r"doc" `` COMPILE but
 *     match NOTHING (0 diagnostics) — the engine never visits comment nodes.
 *   - Control: `JsDecorator()` matches the decorator (1 diagnostic) on the very
 *     same fixture, proving the engine runs on this AST and the negative result
 *     is comment-blindness, not a broken pattern.
 *
 * This is the same comment-blindness that forced `no-triple-slash-reference`
 * (#1/#9), `no-ts-suppression-comments` (#13), `no-block-comment` (#15), and
 * `no-jsdoc-types` (#17) to `unenforceable`. No `.grit` plugin file is shipped
 * (we do not ship no-op plugins).
 *
 * The fixtures (fixtures/jsdoc-before-decorator/{valid,invalid}.ts) are kept so
 * the evidence is reproducible: re-enable the suite below and run `bun test` to
 * confirm that any future comment-capable Biome version would let a plugin flag
 * invalid.ts (>= 1 diagnostic) while staying silent on valid.ts.
 */
describe.skip(RULE, () => {
  test('would stay silent when JSDoc precedes the decorator', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('would flag JSDoc placed between a decorator and its symbol', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(1);
  });
});
