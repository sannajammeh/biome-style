// Concise body — already correct.
const a = (x) => x;
// Multi-statement block — a concise body is impossible; stay silent. (THE TRAP)
const b = (x) => {
  doStuff();
  return x;
};
// Void block with no return — stay silent.
const c = () => {
  doStuff();
};
