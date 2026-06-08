import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-arrow-property';

describe(RULE, () => {
  test('stays silent on methods, non-arrow properties, and non-class arrows', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags class properties initialized with an arrow function', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });

  test('reports the diagnostic at each arrow-property span', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    const lines = diagnostics
      .map((diagnostic) => diagnostic.start.line)
      .sort((a, b) => a - b);
    expect(lines).toEqual([3, 4]);
  });
});
