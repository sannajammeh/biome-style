// `arguments.caller` and `arguments.callee` are forbidden.
function f() {
  return arguments.callee;
}
function g() {
  return arguments.caller;
}
