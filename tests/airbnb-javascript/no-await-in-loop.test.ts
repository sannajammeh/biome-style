import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-await-in-loop';

describe(RULE, () => {
  test('stays silent on awaits not inside a loop', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags `await` inside `for-of` and `while` loop bodies', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
