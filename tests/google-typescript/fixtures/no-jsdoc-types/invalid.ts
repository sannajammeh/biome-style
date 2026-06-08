/**
 * Adds two numbers.
 *
 * @param {number} x the first addend
 * @param {number} y the second addend
 * @returns {number} the sum
 */
export function add(x: number, y: number): number {
  return x + y;
}

/** @private */
class Box {
  /** @override */
  toString(): string {
    return 'box';
  }
}

/** @enum {string} */
const Color = { Red: 'red', Blue: 'blue' } as const;

/**
 * @implements {Serializable}
 */
class Widget {}
