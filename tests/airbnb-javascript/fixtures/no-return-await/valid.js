// Awaiting before returning the resolved value is fine.
async function f() {
  const x = await g();
  return x;
}

// Returning a promise directly (no await) is fine.
async function h() {
  return g();
}

// A bare await statement is fine.
async function k() {
  await g();
}
