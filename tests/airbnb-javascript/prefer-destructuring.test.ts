import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'prefer-destructuring';

describe(RULE, () => {
  test('stays silent on already-destructured and name-mismatch forms', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags name-matched object access and literal-zero array index', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    // 2 object cases (`obj.x`, `obj.sameName`) + 2 array cases (`arr[0]`, `items[0]`).
    expect(diagnostics.length).toBeGreaterThanOrEqual(4);
  });
});
