// An unparenthesized conditional body looks like a comparison (`a => b ? c : d`)
// and must be flagged even with allowParens:true.
const a = (x) => x > 0 ? 1 : -1;
const b = (x) => x ? 1 : 0;
