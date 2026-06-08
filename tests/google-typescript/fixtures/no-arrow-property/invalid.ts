// Classes usually shouldn't have arrow-function properties.
class C {
  handleClick = () => {};
  add = (a: number, b: number) => a + b;
}
