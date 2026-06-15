// Normal function declarations and expressions are fine.
function f() {}
const g = () => {};
const h = function () {};

// Member access on Function is not the Function constructor.
const proto = Function.prototype;
