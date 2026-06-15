// `.apply(...)` for variadic calls should use the spread operator instead.
foo.apply(null, args);
foo.apply(undefined, args);
obj.method.apply(obj, args);
