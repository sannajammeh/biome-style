// Deleting object properties is legitimate; the rule stays silent.
// A `.cjs` script (sloppy mode) is required: in an ES module (strict mode) the
// JS parser rejects `delete <identifier>` outright, so no CST node would exist
// for the plugin to inspect. `delete obj.prop` parses in both, and must NOT flag.
var obj = { prop: 1, key: 2 };
delete obj.prop;
delete obj['key'];
