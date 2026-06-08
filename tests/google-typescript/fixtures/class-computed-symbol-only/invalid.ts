// Computed class keys are allowed only for symbols; string/number literals are not.
class C {
  ['foo']() {}
  [0]: number = 1;
  ['bar'] = 2;
}
