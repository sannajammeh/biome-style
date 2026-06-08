// Symbol-keyed computed members, plain members, and object-literal computed keys are fine.
const sym = Symbol('s');

class C {
  [Symbol.iterator]() {}
  [sym] = 1;
  foo() {}
  bar = 2;
  'quoted'() {}
}

const o = { ['k']: 1 };
