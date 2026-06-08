/**
 * Shared-config formatter coverage (issue #2).
 *
 * Proves the PUBLISHED shared config's formatter block rewrites non-conforming
 * source into the conforming form the coverage matrix requires. Each fixture is
 * intentionally non-conforming; `formatShared` returns the formatted text, and
 * we assert the conforming substring is present and the non-conforming absent.
 */
import { join } from 'node:path';

import { describe, expect, test } from 'bun:test';

import { formatShared } from './harness.ts';

const FIXTURES = join(import.meta.dir, 'fixtures', 'shared-config', 'formatter');

function format(name: string): string {
  return formatShared(join(FIXTURES, `${name}.ts`));
}

describe('shared-config formatter coverage', () => {
  test('uses single quotes', () => {
    const out = format('quotes');
    expect(out).toContain("'hello'");
    expect(out).not.toContain('"hello"');
  });

  test('always inserts semicolons', () => {
    const out = format('semicolons');
    expect(out).toContain('const a = 1;');
  });

  test('always wraps arrow parameters in parentheses', () => {
    const out = format('arrow_parens');
    expect(out).toContain('(x) => x');
    expect(out).not.toMatch(/[^(]x => x/);
  });

  test('lowercases numeric literal prefixes and exponents', () => {
    const out = format('number_casing');
    expect(out).toContain('0xff');
    expect(out).toContain('1e10');
    expect(out).not.toContain('0xFF');
    expect(out).not.toContain('1E10');
  });
});
