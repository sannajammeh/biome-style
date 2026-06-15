import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'func-names';

describe(RULE, () => {
  test('stays silent on declarations, named expressions, and arrows', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags anonymous function expressions', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
