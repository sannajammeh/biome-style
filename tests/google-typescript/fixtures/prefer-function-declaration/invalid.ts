// Module-scope named functions should be declarations, not const-assigned
// arrow functions or function expressions.
const f = () => {};
const g = function () {
  return 1;
};
