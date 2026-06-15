// Returning an awaited expression is redundant; return the promise directly.
async function f() {
  return await g();
}

async function h() {
  return await Promise.resolve(1);
}
