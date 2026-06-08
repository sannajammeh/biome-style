// parseInt with a non-decimal radix is the legitimate use of parseInt.
const hex = parseInt(x, 16);
const bin = parseInt(x, 2);
const oct = parseInt(x, 8);
// Number() is the preferred decimal parser and is never flagged.
const num = Number(x);
// A user-defined function that merely shares part of the name must stay silent.
const own = myParseInt(x, 10);
const f = Number.parseFloat;
