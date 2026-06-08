// `as` on non-object-literal operands, `as const`, and plain annotations are fine.
const a = x as Foo;
const b = foo() as Bar;
const c = [1, 2] as const;
const d = { x: 1 } as const;
const e: Foo = { x: 1 };
