import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'class-computed-symbol-only';

describe(RULE, () => {
  test('stays silent on symbol-keyed, plain, and object-literal computed members', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags string/number-literal computed class keys', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(3);
  });

  test('reports each non-symbol computed key span', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    const lines = diagnostics.map((diagnostic) => diagnostic.start.line).sort();
    expect(lines).toEqual([3, 4, 5]);
  });
});
