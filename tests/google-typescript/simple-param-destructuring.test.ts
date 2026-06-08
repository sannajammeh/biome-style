import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'simple-param-destructuring';

describe(RULE, () => {
  test('stays silent on single-level params and non-param nested destructuring', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags nested and computed destructuring in parameters', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(3);
  });

  test('reports each offending parameter span', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    const lines = diagnostics.map((diagnostic) => diagnostic.start.line).sort();
    expect(lines).toEqual([2, 3, 4]);
  });
});
