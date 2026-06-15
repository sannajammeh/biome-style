import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'new-cap';

describe(RULE, () => {
  test('stays silent on capitalized, member, and plain calls', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags `new foo()` and `new bar()` (lowercase-initial callees)', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
