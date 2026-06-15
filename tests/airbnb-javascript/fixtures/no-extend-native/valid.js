// Extending your own classes' prototypes is fine.
class MyClass {}
MyClass.prototype.method = function () {};

// Normal property assignment is fine.
const o = {};
o.x = 1;

// Assigning to a non-prototype property of a native is fine.
Array.foo = 1;

// Reading a native prototype is fine.
const proto = Array.prototype;
