/**
 * Adds two numbers.
 *
 * @param x the first addend
 * @param y the second addend
 * @returns the sum
 */
export function add(x: number, y: number): number {
  return x + y;
}

// An ordinary prose comment mentioning @param should be ignored too.
const note = 'see @param docs';

/** A plain description with no type-bearing tags. */
class Box {
  toString(): string {
    return 'box';
  }
}
