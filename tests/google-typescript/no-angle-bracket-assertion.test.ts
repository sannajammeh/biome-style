import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-angle-bracket-assertion';

describe(RULE, () => {
  test('stays silent on `as` assertions and generics', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags old-style angle-bracket type assertions', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });

  test('reports the diagnostic at the assertion span', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    const lines = diagnostics.map((diagnostic) => diagnostic.start.line).sort();
    expect(lines).toEqual([2, 3]);
  });
});
