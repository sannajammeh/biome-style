import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'prefer-object-spread';

describe(RULE, () => {
  test('stays silent on Object.assign(target, source) and object spread', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags Object.assign with an object-literal first argument', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
