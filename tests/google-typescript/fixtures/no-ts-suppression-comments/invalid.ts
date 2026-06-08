// @ts-nocheck
// The directive above disables type-checking for the whole file.

// @ts-expect-error suppressing the next line's type error
const broken: number = 'not a number';

/* @ts-expect-error block-comment form of the directive */
const alsoBroken: number = 'still not a number';
