// Type aliases must not bake in nullability.
type A = Foo | null;
type B = Foo | undefined;
type C = Foo | null | undefined;
type D = null | Foo;
