const o = { ['a']: 1, [0]: 2 };

class C {
  ['foo']() {}
  [1]() {}
  get ['g']() {
    return 1;
  }
  ['field'] = 3;
}
