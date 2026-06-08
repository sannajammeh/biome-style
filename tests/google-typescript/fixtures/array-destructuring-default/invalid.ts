// Array-destructuring param with a non-empty array literal as its default.
function f([a, b] = [4, 2]) {
  return a + b;
}
function g([x] = [1]) {
  return x;
}
