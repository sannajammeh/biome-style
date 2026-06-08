// Aliases without null/undefined are fine; optional properties are not aliases.
type A = Foo | Bar;
type B = string | number;
type C = Foo;

interface HasOptional {
  name?: string;
  value?: Foo;
}

function takesNullable(arg: Foo | null): void {}
const x: Bar | undefined = undefined;
