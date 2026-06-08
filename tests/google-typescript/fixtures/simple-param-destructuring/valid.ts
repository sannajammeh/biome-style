// Single-level param destructuring (with defaults) is fine; nested destructuring
// outside a parameter list is also fine.
function a({ x, y }) {}
function b({ x = 1, y = 2 } = {}) {}
function c([a, b]) {}
function d(a, b) {}

const { x: { y } } = obj;
const [{ z }] = list;
