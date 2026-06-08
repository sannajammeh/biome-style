// Function expressions must be arrow functions (Google TS guide).
const anon = function () {
  return 1;
};
const named = function compute() {
  return 2;
};
const mapped = [1, 2, 3].map(function (x) {
  return x * 2;
});
(function () {
  console.log('iife');
})();
