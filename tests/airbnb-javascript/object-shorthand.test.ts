import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'object-shorthand';

describe(RULE, () => {
  test('stays silent on shorthand, distinct key/value, arrows, and quoted keys', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags `{ x: x }` longhand and `{ m: function () {} }` method expressions', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    // 1 repeated-key longhand + 2 function-expression methods.
    expect(diagnostics.length).toBeGreaterThanOrEqual(3);
  });
});
