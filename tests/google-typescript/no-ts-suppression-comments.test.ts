import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-ts-suppression-comments';

/**
 * UNENFORCEABLE in Biome 2.4.16 — comment-blindness.
 *
 * This rule would ban the `@ts-expect-error` and `@ts-nocheck` directive
 * comments (line or block), leaving `@ts-ignore` to the built-in `noTsIgnore`.
 * Both directives live exclusively in COMMENT TRIVIA, which GritQL cannot reach
 * in Biome 2.4.16 — the same wall that made `no-triple-slash-reference`
 * unenforceable (see docs/agents/gritql-plugins.md, "Comments are invisible to
 * the engine").
 *
 * Verified against the real CLI on the fixtures below (node_modules/.bin/biome
 * lint, recommended off, single plugin loaded):
 *
 *   - `comment() as $c { ... }`           → FAILS TO COMPILE (no comment() node kind)
 *   - `` `@ts-expect-error` ``            → compiles, 0 matches
 *   - `` `@ts-nocheck` ``                 → compiles, 0 matches
 *   - r"@ts-(expect-error|nocheck)"       → compiles, 0 matches
 *   - CONTROL `` `"not a number"` `` (an AST node in invalid.ts) → 1 match
 *
 * The control confirms the engine fires on AST nodes in this very file; the
 * directive patterns produce nothing because the text lives in comments. No
 * `.grit` plugin is shipped (a no-op plugin would be dishonest).
 *
 * The fixtures are kept so the evidence is reproducible: invalid.ts carries
 * `// @ts-nocheck`, `// @ts-expect-error`, and the block-comment form;
 * valid.ts carries only ordinary comments. If a future Biome version exposes
 * comment trivia to GritQL, unskip these and author the plugin.
 */
describe.skip(`${RULE} (unenforceable — GritQL comment-blindness, Biome 2.4.16)`, () => {
  test('would flag @ts-expect-error and @ts-nocheck directive comments', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });

  test('would stay silent on ordinary comments', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });
});
