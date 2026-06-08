import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-blank-line-after-decorator';

/**
 * UNENFORCEABLE in Biome 2.4.16 — whitespace-trivia blindness.
 *
 * This rule would flag a blank line between a decorator and the symbol it
 * decorates (the guide requires the decorator to immediately precede the
 * symbol), staying silent when they are adjacent. It cannot be expressed as a
 * GritQL plugin: a blank line is whitespace trivia, and the plugin engine
 * matches on CST nodes, not trivia — so the adjacent and blank-line forms are
 * indistinguishable to the engine.
 *
 * Unlike comments (`no-block-comment` #15 etc.), decorators ARE visible nodes —
 * `JsDecorator()` matches and `JsClassDeclaration() <: contains JsDecorator()`
 * matches a decorated class. That is exactly what makes the negative result
 * conclusive rather than a matching mistake.
 *
 * Verified against the real CLI (the only ground truth — see
 * docs/agents/gritql-plugins.md), comparing an `adjacent.ts` (valid) against a
 * `blank.ts` (one blank line between decorator and class):
 *   - `JsClassDeclaration() <: contains JsDecorator()` fires on BOTH —
 *     1 diagnostic on adjacent, 1 on blank. The engine cannot tell them apart.
 *   - A decorator code snippet that embeds the newline gap
 *     (`` `@$d\n\nclass $name { $... }` ``) COMPILES but matches NOTHING on
 *     either fixture (0 diagnostics); the adjacent-form snippet
 *     (`` `@$d\nclass $name { $... }` ``) likewise matches nothing — decorator
 *     snippets do not bind, and even if they did they would be
 *     whitespace-insensitive.
 *   - There is no line-number / span-arithmetic / trivia predicate in the
 *     Biome 2.4.16 GritQL dialect to compare the decorator's end line with the
 *     symbol's start line.
 *
 * This is the whitespace-trivia sibling of the comment-blindness that forced
 * `no-triple-slash-reference` (#1/#9), `no-ts-suppression-comments` (#13),
 * `no-block-comment` (#15), and `no-jsdoc-types` (#17) to `unenforceable`. No
 * `.grit` plugin file is shipped (we do not ship no-op plugins).
 *
 * The fixtures (fixtures/no-blank-line-after-decorator/{valid,invalid}.ts) are
 * kept so the evidence is reproducible: re-enable the suite below and run
 * `bun test` to confirm that any future trivia-aware Biome version would let a
 * plugin flag invalid.ts (>= 1 diagnostic) while staying silent on valid.ts.
 */
describe.skip(RULE, () => {
  test('would stay silent when the decorator is adjacent to its symbol', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('would flag a blank line between a decorator and its symbol', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(1);
  });
});
