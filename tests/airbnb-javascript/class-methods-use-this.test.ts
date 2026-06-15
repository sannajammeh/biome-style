import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'class-methods-use-this';

describe(RULE, () => {
  test('stays silent on methods using `this`, constructor, static, get/set', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags instance methods that never reference `this`', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
