const o = { a: 1, [myVar]: 2, [a + b]: 3 };

class C {
  foo() {}
  [bar]() {}
  [baz + qux]() {}
}

// Genuinely-dynamic computed member access is unrelated and must stay silent.
const x = o[myVar];
const y = o['a'];
