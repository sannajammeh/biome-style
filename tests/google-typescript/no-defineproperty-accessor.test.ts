import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'no-defineproperty-accessor';

describe(RULE, () => {
  test('stays silent on data descriptors and other Object methods', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags Object.defineProperty with a get/set descriptor', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });

  test('reports each defineProperty accessor span', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    const lines = diagnostics.map((diagnostic) => diagnostic.start.line).sort();
    expect(lines).toEqual([2, 3]);
  });
});
