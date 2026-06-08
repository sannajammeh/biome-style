// Function declarations, arrows, methods, and generators are allowed.
function declared() {
  return 1;
}

const arrow = () => 2;
const arrowBlock = (x: number) => {
  return x * 2;
};
const mapped = [1, 2, 3].map((x) => x * 2);

class Widget {
  method() {
    return 3;
  }
  *gen() {
    yield 4;
  }
}

const genExpr = function* () {
  yield 5;
};
const namedGenExpr = function* counter() {
  yield 6;
};
[1].forEach(function* () {
  yield 7;
});
