import { DddValueObject } from '@nestjslatam/ddd-lib';

/**
 * Value Object representing a monetary amount with currency.
 * Provides type-safe money operations and formatting.
 *
 * @remarks
 * Uses the Martin Fowler Money pattern to avoid floating-point precision issues.
 * Stores amounts as integers (cents) internally.
 *
 * @example
 * ```typescript
 * const price = Money.fromAmount(99.99, 'USD');
 * const total = price.multiply(3);
 * const sum = price.add(Money.fromAmount(10, 'USD'));
 *
 * console.log(total.format()); // "$299.97"
 * ```
 */
export class Money extends DddValueObject<{
  amount: number;
  currency: string;
}> {
  private static readonly DECIMAL_PLACES = 2;
  private static readonly MULTIPLIER = Math.pow(10, Money.DECIMAL_PLACES);

  protected constructor(amountInCents: number, currency: string) {
    super({ amount: amountInCents, currency: currency.toUpperCase() });
  }

  /**
   * Creates Money from a decimal amount.
   *
   * @param amount Decimal amount (e.g., 99.99)
   * @param currency ISO currency code (e.g., 'USD', 'EUR')
   * @returns Money instance
   */
  public static fromAmount(amount: number, currency: string = 'USD'): Money {
    const amountInCents = Math.round(amount * Money.MULTIPLIER);
    return new Money(amountInCents, currency);
  }

  /**
   * Creates Money from cents.
   *
   * @param cents Amount in cents (e.g., 9999 for $99.99)
   * @param currency ISO currency code
   * @returns Money instance
   */
  public static fromCents(cents: number, currency: string = 'USD'): Money {
    return new Money(cents, currency);
  }

  /**
   * Creates a zero money value.
   *
   * @param currency ISO currency code
   * @returns Money instance with zero amount
   */
  public static zero(currency: string = 'USD'): Money {
    return new Money(0, currency);
  }

  /**
   * Gets the amount in cents (integer).
   */
  public get cents(): number {
    return this.getValue().amount;
  }

  /**
   * Gets the amount as a decimal.
   */
  public get amount(): number {
    return this.cents / Money.MULTIPLIER;
  }

  /**
   * Gets the currency code.
   */
  public get currency(): string {
    return this.getValue().currency;
  }

  /**
   * Adds two money values.
   *
   * @param other Money to add
   * @returns New Money instance with sum
   * @throws Error if currencies don't match
   */
  public add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.cents + other.cents, this.currency);
  }

  /**
   * Subtracts two money values.
   *
   * @param other Money to subtract
   * @returns New Money instance with difference
   * @throws Error if currencies don't match
   */
  public subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.cents - other.cents, this.currency);
  }

  /**
   * Multiplies money by a factor.
   *
   * @param factor Multiplication factor
   * @returns New Money instance
   */
  public multiply(factor: number): Money {
    return new Money(Math.round(this.cents * factor), this.currency);
  }

  /**
   * Divides money by a divisor.
   *
   * @param divisor Division factor
   * @returns New Money instance
   */
  public divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Cannot divide money by zero');
    }
    return new Money(Math.round(this.cents / divisor), this.currency);
  }

  /**
   * Checks if amount is positive.
   */
  public isPositive(): boolean {
    return this.cents > 0;
  }

  /**
   * Checks if amount is zero.
   */
  public isZero(): boolean {
    return this.cents === 0;
  }

  /**
   * Checks if amount is negative.
   */
  public isNegative(): boolean {
    return this.cents < 0;
  }

  /**
   * Compares with another Money value.
   *
   * @param other Money to compare
   * @returns -1 if less, 0 if equal, 1 if greater
   * @throws Error if currencies don't match
   */
  public compareTo(other: Money): number {
    this.assertSameCurrency(other);
    if (this.cents < other.cents) return -1;
    if (this.cents > other.cents) return 1;
    return 0;
  }

  /**
   * Formats money for display.
   *
   * @param locale Locale for formatting (default: 'en-US')
   * @returns Formatted string (e.g., "$99.99")
   */
  public format(locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }

  /**
   * Converts to plain object for serialization.
   */
  public toJSON(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  protected getEqualityComponents(): Iterable<any> {
    return [this.cents, this.currency];
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Currency mismatch: ${this.currency} vs ${other.currency}`,
      );
    }
  }

  override addValidators(): void {
    super.addValidators();
    // Money validation is done through factory methods and operations
  }
}
