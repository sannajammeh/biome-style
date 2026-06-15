import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-proto';

describe(RULE, () => {
  test('stays silent on Object.getPrototypeOf and normal property access', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags `obj.__proto__` reads and `foo.__proto__ = x` writes', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
