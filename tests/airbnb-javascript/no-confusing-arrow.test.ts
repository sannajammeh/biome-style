import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-confusing-arrow';

describe(RULE, () => {
  test('stays silent on parenthesized ternary bodies and non-conditional arrows', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags unparenthesized conditional arrow bodies', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(1);
  });
});
