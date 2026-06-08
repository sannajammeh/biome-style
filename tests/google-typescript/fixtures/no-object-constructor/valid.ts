// Object literals and Object static methods are allowed.
const empty = {};
const point = { x: 1, y: 2 };
const keys = Object.keys(point);
const merged = Object.assign({}, point);
const frozen = Object.freeze(point);
