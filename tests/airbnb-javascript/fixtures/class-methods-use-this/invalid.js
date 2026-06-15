// Instance methods that never reference `this` should be static or standalone.
class C {
  noThis() {
    return 42;
  }

  alsoNo() {
    return doStuff();
  }
}
