import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-private-identifier';

describe(RULE, () => {
  test('stays silent on `private`-modifier and public members', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags `#`-prefixed fields, methods, and accessors', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(4);
  });

  test('reports the diagnostics at the member spans', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    const lines = diagnostics.map((diagnostic) => diagnostic.start.line).sort(
      (a, b) => a - b,
    );
    expect(lines).toEqual([3, 5, 9, 13]);
  });
});
