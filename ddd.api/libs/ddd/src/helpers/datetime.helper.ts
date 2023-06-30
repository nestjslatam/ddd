export class DateTimeHelper {
  static getUtcDate(): Date {
    const year = new Date().getUTCFullYear();
    const month = new Date().getUTCMonth();
    const day = new Date().getUTCDate();

    return new Date(Date.UTC(year, month, day));
  }
}
