// Methods that reference `this` are correct instance methods.
class C {
  useThis() {
    return this.x;
  }

  alsoUsesThis() {
    this.doWork();
    return 1;
  }

  // The constructor never counts, even when it does not read `this`.
  constructor() {
    this.x = 1;
  }

  // Static methods have no `this` semantics — out of scope.
  static makeDefault() {
    return new C();
  }

  // Getters/setters are a distinct member kind — out of scope.
  get value() {
    return 42;
  }

  set value(v) {
    doStuff(v);
  }
}
