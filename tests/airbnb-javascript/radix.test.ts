import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'radix';

describe(RULE, () => {
  test('stays silent when parseInt is given an explicit radix', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags `parseInt(x)` calls with no radix', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
