import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-script-url';

describe(RULE, () => {
  test('stays silent on ordinary URL strings', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags `javascript:` URL string literals', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
