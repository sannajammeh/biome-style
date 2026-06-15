import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'prefer-spread';

describe(RULE, () => {
  test('stays silent on spread calls, normal calls, and `.call(...)`', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags `.apply(...)` member calls', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
