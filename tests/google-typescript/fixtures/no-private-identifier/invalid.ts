// ECMAScript `#private` members are banned; use the `private` modifier instead.
class Account {
  #balance = 0;

  #withdraw(amount: number): void {
    console.log(amount);
  }

  get #currentBalance(): number {
    return 0;
  }

  set #currentBalance(value: number) {
    console.log(value);
  }
}
