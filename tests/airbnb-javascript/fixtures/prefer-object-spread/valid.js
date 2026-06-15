// `Object.assign(target, source)` where the first arg is an existing object
// (a variable) is a legitimate mutation — not flagged by this rule.
Object.assign(target, source);
Object.assign(dest, a, b);
// Object spread is already the preferred form.
const merged = { ...a, ...b };
const extended = { ...base, c: 1 };
