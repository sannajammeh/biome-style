// Function declarations are always named — and are a different construct.
function foo() {}
// Named function expressions are exactly what the rule wants.
const f = function named() {};
// Arrow functions are out of scope for func-names.
const g = () => {};
arr.map((x) => x);
