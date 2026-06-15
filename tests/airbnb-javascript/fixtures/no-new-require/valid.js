// Normal CommonJS require, no `new` on its result.
const x = require('x');
// `new` on a constructor that takes a require call as an argument is fine.
const f = new Foo(require('y'));
