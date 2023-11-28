export const GUARD_ERROR_MESSAGE_LENGTH =
  'Cannot check length of a value. Provided value is empty';

export class ValueGuard {
  static isEmpty(value: unknown): boolean {
    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value instanceof Date
    )
      return false;

    if (
      typeof value === 'undefined' ||
      value === null ||
      (value instanceof Object && !Object.keys(value).length) ||
      value === ''
    )
      return true;

    if (Array.isArray(value)) {
      if (value.length === 0) return true;

      if (value.every((item) => this.isEmpty(item))) {
        return true;
      }
    }

    return false;
  }

  static lengthIsBetween(
    value: number | string | Array<unknown>,
    min: number,
    max: number,
  ): boolean {
    if (this.isEmpty(value)) throw new Error(GUARD_ERROR_MESSAGE_LENGTH);

    const valueLength = this.getValueLength(value);

    return valueLength >= min && valueLength <= max ? true : false;
  }

  private static getValueLength = (value: number | string | Array<unknown>) =>
    typeof value === 'number' ? Number(value).toString().length : value.length;
}
