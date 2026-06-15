import { describe, expect, test } from 'bun:test';

import { runPlugin } from './harness.ts';

const RULE = 'arrow-body-style';

describe(RULE, () => {
  test('stays silent on concise, multi-statement, and void block bodies', async () => {
    const diagnostics = await runPlugin(RULE, 'valid');
    expect(diagnostics).toHaveLength(0);
  });

  test('flags arrow blocks whose only statement is `return <expr>;`', async () => {
    const diagnostics = await runPlugin(RULE, 'invalid');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
  });
});
