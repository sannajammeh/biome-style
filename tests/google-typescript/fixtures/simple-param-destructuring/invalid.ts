// Parameter destructuring must be single-level and non-computed.
function a({ x: { y } }) {}
function b({ [k]: v }) {}
function c([{ z }]) {}
