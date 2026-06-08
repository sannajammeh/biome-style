// parseFloat is always banned; use Number() for decimal parsing.
const a = parseFloat(x);
// parseInt without a radix defaults to base 10 — use Number() instead.
const b = parseInt(x);
// parseInt with an explicit base-10 radix — still use Number().
const c = parseInt(x, 10);
