// Already-shorthand property and method — nothing to convert.
const short = { x };
const methodShort = { m() {} };

// Genuinely-different key/value — not a shorthand candidate.
const diff = { a: b };

// Arrow values are NOT converted to methods under `always` — stay silent.
const arrow = { f: () => {} };

// Quoted / numeric keys whose value equals the key text are NOT shorthand
// candidates (and `avoidQuotes` would forbid the conversion anyway).
const quoted = { 'q': 'q' };
const numeric = { 1: 1 };
