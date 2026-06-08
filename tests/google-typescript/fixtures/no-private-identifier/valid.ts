// The TypeScript `private` modifier is the guide-sanctioned form.
class Account {
  private balance = 0;
  private readonly id = 'abc';

  private withdraw(amount: number): void {
    this.balance -= amount;
  }

  private get currentBalance(): number {
    return this.balance;
  }

  private set currentBalance(value: number) {
    this.balance = value;
  }

  // Ordinary public members are fine too.
  owner = 'nobody';

  deposit(amount: number): void {
    this.balance += amount;
  }

  // A private-in check references a field but does not declare one.
  static isAccount(obj: unknown): boolean {
    return typeof obj === 'object' && obj !== null && 'balance' in obj;
  }
}
