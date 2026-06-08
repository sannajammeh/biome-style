// A blank line between a decorator and the symbol it decorates — the guide
// requires the decorator to immediately precede the symbol (§5.10).
@Component()

class Foo {}

class Bar {
  @Input()

  name = 'x';
}
