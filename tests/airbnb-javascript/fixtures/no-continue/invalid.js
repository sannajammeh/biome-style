// `continue` (and labeled `continue`) must not be used.
for (let i = 0; i < 10; i += 1) {
  if (i === 5) {
    continue;
  }
  doSomething(i);
}

outer: for (let i = 0; i < 10; i += 1) {
  for (let j = 0; j < 10; j += 1) {
    if (j === 3) {
      continue outer;
    }
  }
}
