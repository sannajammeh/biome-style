// Using `new` on the result of a require call is disallowed.
const a = new require('a');
new require('b');
