/**
 * Shared-config built-in coverage (issue #2).
 *
 * Proves the PUBLISHED shared config (`guides/google-typescript/biome.json`)
 * actually enforces the directives the coverage matrix assigns to the
 * `builtin` mechanism — independent of the GritQL plugins — and at the matrix
 * severity. Guards against silent drift when a Biome upgrade renames or moves
 * a rule (as happened with the phantom `noMultilineString`).
 *
 * Each case: invalid.ts must produce a diagnostic for that rule at the matrix
 * severity; valid.ts must produce zero diagnostics for that rule.
 */
import { join } from 'node:path';

import { describe, expect, test } from 'bun:test';

import {
  diagnosticsFor,
  runSharedConfig,
  type SharedDiagnostic,
} from './harness.ts';

const FIXTURES = join(import.meta.dir, 'fixtures', 'shared-config');

function fixture(rule: string, kind: 'valid' | 'invalid'): string {
  return join(FIXTURES, rule, `${kind}.ts`);
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
  { dir: 'useConst', category: 'lint/style/useConst', severity: 'error' },
  {
    dir: 'noDefaultExport',
    category: 'lint/style/noDefaultExport',
    severity: 'error',
  },
  {
    dir: 'useThrowNewError',
    category: 'lint/style/useThrowNewError',
    severity: 'error',
  },
  {
    dir: 'noConstEnum',
    category: 'lint/suspicious/noConstEnum',
    severity: 'error',
  },
  {
    dir: 'useConsistentMemberAccessibility',
    category: 'lint/style/useConsistentMemberAccessibility',
    severity: 'error',
  },
  {
    dir: 'useBlockStatements',
    category: 'lint/style/useBlockStatements',
    severity: 'error',
  },
  { dir: 'noTsIgnore', category: 'lint/suspicious/noTsIgnore', severity: 'error' },
  {
    dir: 'noExplicitAny',
    category: 'lint/suspicious/noExplicitAny',
    severity: 'warning',
  },
];

describe('shared-config built-in coverage', () => {
  for (const { dir, category, severity } of CASES) {
    describe(dir, () => {
      test(`invalid.ts fires ${category} at ${severity}`, () => {
        const diagnostics = runSharedConfig(fixture(dir, 'invalid'));
        const hits = diagnosticsFor(diagnostics, category);
        expect(hits.length).toBeGreaterThanOrEqual(1);
        for (const hit of hits) {
          expect(hit.severity).toBe(severity);
        }
      });

      test('valid.ts produces zero diagnostics for the rule', () => {
        const diagnostics = runSharedConfig(fixture(dir, 'valid'));
        expect(diagnosticsFor(diagnostics, category)).toHaveLength(0);
      });
    });
  }

  // `noUselessConstructor`: the parameter-property exemption is load-bearing
  // per the matrix, so it gets a bespoke valid case rather than an empty body.
  describe('noUselessConstructor', () => {
    const CATEGORY = 'lint/complexity/noUselessConstructor';

    test('invalid.ts flags an empty constructor at error', () => {
      const diagnostics = runSharedConfig(fixture('noUselessConstructor', 'invalid'));
      const hits = diagnosticsFor(diagnostics, CATEGORY);
      expect(hits.length).toBeGreaterThanOrEqual(1);
      for (const hit of hits) {
        expect(hit.severity).toBe('error');
      }
    });

    test('valid.ts does NOT flag a parameter-property constructor', () => {
      const diagnostics = runSharedConfig(fixture('noUselessConstructor', 'valid'));
      expect(diagnosticsFor(diagnostics, CATEGORY)).toHaveLength(0);
    });
  });
});
