import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'wrap-iife';

describe(RULE, () => {
  test('stays silent on the call-inside-parens IIFE form', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags the call-outside-parens IIFE form (function & arrow)', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
