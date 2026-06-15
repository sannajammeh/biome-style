// Sequential awaits outside any loop are fine.
async function f() {
  const a = await g();
  const b = await h();
  return [a, b];
}

// Awaiting Promise.all over a map — the await lives in a nested arrow, not a loop.
async function p(items) {
  return Promise.all(items.map(async (i) => await g(i)));
}
