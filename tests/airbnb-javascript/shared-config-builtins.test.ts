/**
 * Shared-config built-in coverage (Airbnb JavaScript).
 *
 * Proves the PUBLISHED shared config (`guides/airbnb-javascript/biome.json`)
 * actually enforces the rules the coverage matrix assigns to the `builtin`
 * mechanism — independent of any GritQL plugin — and at the matrix severity.
 * Guards against silent drift when a Biome upgrade renames, moves, or restages
 * a rule.
 *
 * The cases deliberately span the load-bearing edges of a config-keyed port:
 *   - `noConsole` / `useArrowFunction` carry `warning` (config level `1`, and
 *     `useArrowFunction` is the rule the Google port forbids — here it is on);
 *   - `noShadow` is a `nursery` rule, proving the nursery group is active;
 *   - the rest are `error`.
 *
 * Each case: invalid.js must produce a diagnostic for that rule at the matrix
 * severity; valid.js must produce zero diagnostics for that rule.
 */
import { join } from 'node:path';

import { describe, expect, test } from 'bun:test';

import { diagnosticsFor, runSharedConfig } from './harness.ts';

const FIXTURES = join(import.meta.dir, 'fixtures', 'shared-config');

function fixture(rule: string, kind: 'valid' | 'invalid'): string {
  return join(FIXTURES, rule, `${kind}.js`);
}

interface BuiltinCase {
  /** Fixture directory name. */
  dir: string;
  /** Full Biome rule id, e.g. `lint/suspicious/noVar`. */
  category: string;
  /** Expected severity per the coverage matrix. */
  severity: 'error' | 'warning';
}

const CASES: BuiltinCase[] = [
  { dir: 'noVar', category: 'lint/suspicious/noVar', severity: 'error' },
  {
    dir: 'noDoubleEquals',
    category: 'lint/suspicious/noDoubleEquals',
    severity: 'error',
  },
  { dir: 'useConst', category: 'lint/style/useConst', severity: 'error' },
  {
    dir: 'noYodaExpression',
    category: 'lint/style/noYodaExpression',
    severity: 'error',
  },
  {
    dir: 'useNamingConvention',
    category: 'lint/style/useNamingConvention',
    severity: 'error',
  },
  // Config level `1` → `warning`.
  { dir: 'noConsole', category: 'lint/suspicious/noConsole', severity: 'warning' },
  {
    dir: 'useArrowFunction',
    category: 'lint/complexity/useArrowFunction',
    severity: 'warning',
  },
  // `nursery` group must be active for this to fire at all.
  { dir: 'noShadow', category: 'lint/nursery/noShadow', severity: 'error' },
];

describe('shared-config built-in coverage', () => {
  for (const { dir, category, severity } of CASES) {
    describe(dir, () => {
      test(`invalid.js fires ${category} at ${severity}`, () => {
        const diagnostics = runSharedConfig(fixture(dir, 'invalid'));
        const hits = diagnosticsFor(diagnostics, category);
        expect(hits.length).toBeGreaterThanOrEqual(1);
        for (const hit of hits) {
          expect(hit.severity).toBe(severity);
        }
      });

      test('valid.js produces zero diagnostics for the rule', () => {
        const diagnostics = runSharedConfig(fixture(dir, 'valid'));
        expect(diagnosticsFor(diagnostics, category)).toHaveLength(0);
      });
    });
  }
});
