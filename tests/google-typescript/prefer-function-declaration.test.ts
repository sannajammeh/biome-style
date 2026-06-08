import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'prefer-function-declaration';

describe(RULE, () => {
  test('stays silent on declarations, non-functions, nested fns, callbacks, and class props', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags module-scope const arrow and const function-expression assignments', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });

  test('reports the diagnostic at each module-scope function assignment', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    const lines = diagnostics
      .map((diagnostic) => diagnostic.start.line)
      .sort((a, b) => a - b);
    expect(lines).toEqual([3, 4]);
  });
});
