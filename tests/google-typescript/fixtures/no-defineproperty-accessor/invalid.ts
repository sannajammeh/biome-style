// Defining accessors via Object.defineProperty is banned; use class get/set.
Object.defineProperty(obj, 'x', { get() { return 1; } });
Object.defineProperty(obj, 'y', { set(v) {}, configurable: true });
