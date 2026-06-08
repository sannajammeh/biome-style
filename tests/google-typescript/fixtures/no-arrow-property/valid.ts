// Methods and non-arrow properties are fine; arrow functions outside a class
// (plain consts, object-literal properties) must stay silent.
class C {
  handleClick() {}
  count = 0;
  label = 'x';
}

const f = () => {};
const obj = { g: () => {} };
