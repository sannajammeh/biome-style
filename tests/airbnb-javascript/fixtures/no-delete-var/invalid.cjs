// Deleting a bare variable is not allowed. A `.cjs` script (sloppy mode) is
// required: in strict mode `delete x` is a parse error, not a matchable node.
var x = 1;
var y = 2;
delete x;
delete y;
