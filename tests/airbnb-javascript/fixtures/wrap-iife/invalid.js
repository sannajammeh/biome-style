// Violation: the call parens are OUTSIDE the wrapper — function wrapped, then called.
const a = (function () {
  doStuff();
})();

const b = (() => {
  doStuff();
})();
