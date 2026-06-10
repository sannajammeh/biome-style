/**
 * Shared-config formatter coverage (Airbnb JavaScript).
 *
 * Proves the PUBLISHED shared config's formatter block rewrites non-conforming
 * source into the conforming form the coverage matrix requires — the large
 * `style`-group slice that the matrix maps to `formatter` rather than a
 * diagnostic. Each fixture is intentionally non-conforming; `formatShared`
 * returns the formatted text and we assert the conforming form is present and
 * the non-conforming form absent.
 */
import { join } from 'node:path';

import { describe, expect, test } from 'bun:test';

import { formatShared } from './harness.ts';

const FIXTURES = join(import.meta.dir, 'fixtures', 'shared-config', 'formatter');

function format(name: string): string {
  return formatShared(join(FIXTURES, `${name}.js`));
}

describe('shared-config formatter coverage', () => {
  test('uses single quotes (quotes)', () => {
    const out = format('quotes');
    expect(out).toContain("'hello'");
    expect(out).not.toContain('"hello"');
  });

  test('always inserts semicolons (semi)', () => {
    const out = format('semicolons');
    expect(out).toContain('const a = 1;');
  });

  test('always wraps arrow parameters in parentheses (arrow-parens)', () => {
    const out = format('arrow_parens');
    expect(out).toContain('(x) => x');
    expect(out).not.toMatch(/[^(]x => x/);
  });

  test('adds trailing commas in multiline literals (comma-dangle)', () => {
    const out = format('trailing_commas');
    expect(out).toMatch(/,\n]/);
  });

  test('removes unnecessary property quotes (quote-props as-needed)', () => {
    const out = format('quote_props');
    expect(out).toContain('{ a: 1 }');
    expect(out).not.toContain("'a':");
  });

  test('indents with two spaces (indent)', () => {
    const out = format('indent');
    expect(out).toContain('\n  return 1;');
  });
});
