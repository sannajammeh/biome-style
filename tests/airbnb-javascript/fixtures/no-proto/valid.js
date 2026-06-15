// Use Object.getPrototypeOf / setPrototypeOf instead of __proto__.
const proto = Object.getPrototypeOf(obj);
Object.setPrototypeOf(obj, baseProto);
// `proto` (without underscores) is a normal property; leave it alone.
const p = obj.proto;
obj.proto = bar;
// Other normal property access.
const x = foo.bar;
foo.baz = qux;
