import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'array-destructuring-default';

describe(RULE, () => {
  test('stays silent on LHS defaults, plain destructuring, and objects', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags array-destructuring params with a non-empty array-literal default', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });

  test('reports the diagnostic at the parameter span', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    const lines = diagnostics.map((diagnostic) => diagnostic.start.line).sort();
    expect(lines).toEqual([2, 5]);
  });
});
