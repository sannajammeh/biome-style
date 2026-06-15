// Already destructured — the conforming form.
const { x } = obj;
const [first] = arr;
// Name mismatch on object access is outside the safe subset (binding name !==
// accessed property name), so it stays silent.
const a = obj.b;
const diff = thing.other;
// Non-zero / non-literal array index is not the `[0]` head case.
const second = arr[1];
const item = arr[i];
const last = arr[arr.length - 1];
