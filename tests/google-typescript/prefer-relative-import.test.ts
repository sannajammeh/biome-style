import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'prefer-relative-import';

/**
 * UNENFORCEABLE as a guide-universal rule — a per-project policy call, not an
 * engine limitation. (Recorded human/HITL decision; this rule was filed
 * `ready-for-human` precisely because that policy call gates it.)
 *
 * The guide says to prefer relative imports *within a project*. Unlike the
 * comment/whitespace walls, the GritQL engine CAN see and match import
 * specifiers — verified against the real CLI (see docs/agents/gritql-plugins.md):
 *   - `` `import $clause from $src` `` with `` $src <: r".*foo.*" `` matches the
 *     `@/foo` import (1 diagnostic, correct span) and stays silent on `react`
 *     and `./local`. Specifier-string matching works.
 *
 * What is NOT mechanizable is the *classification* the rule depends on:
 * distinguishing a "within-project" import from a legitimate external package
 * requires module-resolver / tsconfig `paths` knowledge that is project-specific
 * and unavailable to a single-file, syntax-only plugin. A bare specifier like
 * `mymodule` is indistinguishable from an npm package by syntax alone; and any
 * fixed prefix allow-list (`@/`, `~/`, `src/`, `app/`) is one project's
 * convention, not part of the Google TypeScript Style Guide. Shipping such a
 * list in the published guide would flag valid code in every project that uses
 * those prefixes differently.
 *
 * Decision: reclassify plugin → `unenforceable` in COVERAGE.md. The mechanism
 * exists, but the policy is per-project, so this is best left as an opt-in
 * project-local plugin rather than a guide rule. No `.grit` file is shipped (we
 * do not ship rules whose correctness depends on unstated project policy).
 *
 * The fixtures (fixtures/prefer-relative-import/{valid,invalid}.ts) record what
 * an alias-prefix policy WOULD flag, so a project adopting one can lift them
 * into a local plugin: re-enable the suite below and author a `.grit` that
 * matches the project's agreed within-project prefixes.
 */
describe.skip(RULE, () => {
  test('would stay silent on external packages and relative imports', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('would flag within-project imports written as absolute/aliased paths', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
