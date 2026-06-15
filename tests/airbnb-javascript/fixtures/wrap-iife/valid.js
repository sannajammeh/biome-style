// Correct "outside" form: the call is INSIDE the wrapping parentheses.
const a = (function () {
  doStuff();
}());

const b = (() => {
  doStuff();
}());
