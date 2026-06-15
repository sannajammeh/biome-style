import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-buffer-constructor';

describe(RULE, () => {
  test('stays silent on `Buffer.from` and `Buffer.alloc`', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags `new Buffer(...)` and bare `Buffer(...)`', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
