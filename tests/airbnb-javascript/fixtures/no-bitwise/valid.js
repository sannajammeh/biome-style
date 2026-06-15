// Logical operators are fine — only bitwise operators are banned.
const a = x && y;
const b = x || y;
const c = (x && y) || z;
const d = !x;
const e = x === y;
const f = x !== y;
let g = false;
g ||= y;
g &&= y;
g ??= y;
