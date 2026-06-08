// Function declarations are fine; non-function consts are irrelevant; nested
// functions, inline callbacks, and class arrow properties are out of scope.
function h() {}

const x = 1;

function outer() {
  const inner = () => {};
  return inner;
}

[1, 2].map((n) => n + 1);

class C {
  m = () => {};
}
