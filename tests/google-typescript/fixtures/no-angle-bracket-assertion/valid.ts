// `as` assertions and generics are allowed.
const a = bar as Foo;
const b = value as string;
const list: Array<number> = [];
const map: Map<string, number> = new Map<string, number>();
const result = identity<string>('x');

function identity<T>(value: T): T {
  return value;
}
