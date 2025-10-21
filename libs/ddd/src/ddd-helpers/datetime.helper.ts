/**
 * Helper class for working with dates and times.
 */
export class DateTimeHelper {
  /**
   * Gets the current UTC date.
   * @returns The current UTC date.
   */
  static getUtcDate(): Date {
    const year = new Date().getUTCFullYear();
    const month = new Date().getUTCMonth();
    const day = new Date().getUTCDate();

    return new Date(Date.UTC(year, month, day));
  }

  /**
   * Gets the current timestamp.
   * @returns The current timestamp.
   */
  static getTimeStamp(): number {
    return +new Date();
  }
}
