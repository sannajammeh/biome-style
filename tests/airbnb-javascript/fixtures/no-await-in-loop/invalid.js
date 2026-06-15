// await directly inside loop bodies — performance footgun, run in parallel instead.
async function f(items) {
  for (const i of items) {
    await g(i);
  }

  let n = 0;
  while (n < 3) {
    await h();
    n++;
  }
}
