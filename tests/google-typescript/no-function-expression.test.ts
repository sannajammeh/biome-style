import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-function-expression';

describe(RULE, () => {
  test('stays silent on declarations, arrows, methods, and generators', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags anonymous/named function expressions, args, and IIFEs', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(4);
  });

  test('reports the diagnostic at each function expression span', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    const lines = diagnostics.map((diagnostic) => diagnostic.start.line).sort(
      (a, b) => a - b,
    );
    expect(lines).toEqual([2, 5, 8, 11]);
  });
});
