// The Function constructor builds functions from strings — never do this.
const add = new Function('a', 'b', 'return a + b');
const f = Function('return 1');
