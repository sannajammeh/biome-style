// Object literals are fine; a bare Object() call is not flagged by no-new-object.
const a = {};
const b = { x: 1 };
const keys = Object.keys(b);
