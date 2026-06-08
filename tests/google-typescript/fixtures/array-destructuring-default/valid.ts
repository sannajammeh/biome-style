// Per-element defaults on the LHS, plain destructuring, and object destructuring.
function withLhsDefaults([a = 4, b = 2] = []) {
  return a + b;
}
function noDefault([a, b]) {
  return a + b;
}
function emptyArrayDefault([a, b] = []) {
  return a + b;
}
function objectDestructuring({ a, b } = { a: 1, b: 2 }) {
  return a + b;
}
