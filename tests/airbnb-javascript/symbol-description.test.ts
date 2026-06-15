import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'symbol-description';

describe(RULE, () => {
  test('stays silent when Symbol is given a description or Symbol.for is used', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags `Symbol()` calls with no description', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
