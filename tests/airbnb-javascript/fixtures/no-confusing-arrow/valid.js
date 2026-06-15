// With allowParens:true, a parenthesized conditional body is the disambiguated,
// allowed form — it must stay silent.
const a = (x) => (x > 0 ? 1 : -1);
const b = (x) => (x ? 1 : 0);

// Non-conditional arrows are never confusing.
const c = (x) => x + 1;
const d = (x) => x;

// A block-bodied arrow returning a ternary reads unambiguously.
const e = (x) => {
  return x > 0 ? 1 : -1;
};
