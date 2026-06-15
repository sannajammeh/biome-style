// Spread calls and ordinary calls are fine — only `.apply(...)` is flagged.
foo(...args);
foo(a, b, c);
foo.call(thisArg, a, b);
obj.method.call(obj, a, b);
const x = Math.max(...values);
