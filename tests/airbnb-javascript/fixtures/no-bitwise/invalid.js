// Bitwise operators and bitwise-assignment forms are banned.
const a = x & y;
const b = x | y;
const c = x ^ y;
const d = ~x;
const e = x << 2;
const f = x >> 2;
const g = x >>> 2;
let h = 1;
h &= y;
h |= y;
h ^= y;
h <<= 2;
h >>= 2;
h >>>= 2;
