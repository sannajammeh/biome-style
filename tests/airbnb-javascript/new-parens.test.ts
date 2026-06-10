import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'new-parens';

describe(RULE, () => {
  test('stays silent on constructor calls with parentheses', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags `new Foo` and `new ns.Foo` without parentheses', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
