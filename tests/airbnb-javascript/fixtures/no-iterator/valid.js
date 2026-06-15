// Use the iteration protocol via `Symbol.iterator`, not the legacy
// `__iterator__`. Normal property access is also fine.
const iter = obj[Symbol.iterator]();
Foo.prototype[Symbol.iterator] = function* () {
  yield* this.items;
};
const value = obj.someProperty;
const nested = obj.iterator;
