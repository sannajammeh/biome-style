// Data descriptors, other Object methods, and real accessors are all fine.
Object.defineProperty(obj, 'x', { value: 1, writable: true });
Object.defineProperties(obj, {});
Object.keys(obj);
Object.assign(obj, {});
const d = { get x() { return 1; } };
