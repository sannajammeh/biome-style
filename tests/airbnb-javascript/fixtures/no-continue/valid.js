// Loops without `continue` are fine — use plain bodies or `break`.
for (let i = 0; i < 10; i += 1) {
  if (i === 5) {
    break;
  }
  doSomething(i);
}

while (running) {
  process();
}
