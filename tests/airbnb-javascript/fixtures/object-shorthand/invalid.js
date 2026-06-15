// (a) Longhand property where the key name equals the value identifier —
// should be written as the shorthand `{ x }`.
const same = { x: x };

// (b) Method written as a function-expression property — should be the
// concise method `{ m() {} }`.
const method = { m: function () {} };
const withArgs = { p: function (a, b) { return a + b; } };
