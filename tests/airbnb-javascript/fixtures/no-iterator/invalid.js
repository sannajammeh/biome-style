// The legacy `__iterator__` property is forbidden.
const i = obj.__iterator__;
Foo.prototype.__iterator__ = fn;
