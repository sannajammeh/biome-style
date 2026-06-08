import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-unary-plus';

describe(RULE, () => {
  test('stays silent on binary addition, increment, and compound assignment', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags unary plus coercions', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(4);
  });

  test('reports the diagnostic at each unary plus span', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    const lines = diagnostics.map((diagnostic) => diagnostic.start.line).sort();
    expect(lines).toEqual([2, 3, 4, 5]);
  });
});
