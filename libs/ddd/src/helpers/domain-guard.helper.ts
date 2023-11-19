import { DomainValueObject } from '../valueobjects';

const URL_REGEX_PATTERN = /^(ftp|http|https):\/\/[^ "]+$/;

const ERROR_MESSAGE_LENGTH =
  'Cannot check length of a value. Provided value is empty';

export class DomainGuard {
  static isValueObject(obj: unknown): obj is DomainValueObject<unknown> {
    return obj instanceof DomainValueObject;
  }

  static isInstanceOfValueObject(obj: any): boolean {
    if (obj === null || obj === undefined) return false;

    if (typeof obj === 'string' || typeof obj === 'boolean') return false;

    const canConvert = obj as DomainValueObject<unknown>;

    return !canConvert ? false : true;
  }

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

      if (value.every((item) => DomainGuard.isEmpty(item))) {
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
    if (DomainGuard.isEmpty(value)) throw new Error(ERROR_MESSAGE_LENGTH);

    const valueLength = this.getValueLength(value);

    return valueLength >= min && valueLength <= max ? true : false;
  }

  static lenghtIsEqual(
    value: number | string | Array<unknown>,
    length: number,
  ): boolean {
    if (DomainGuard.isEmpty(value)) throw new Error(ERROR_MESSAGE_LENGTH);

    return this.getValueLength(value) === length ? true : false;
  }

  static isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  static isString(value: unknown) {
    return typeof value === 'string';
  }

  static isNumber(value: unknown) {
    return typeof value === 'number';
  }

  static isNumberBetween(value: number, min: number, max: number) {
    if (DomainGuard.isEmpty(value)) throw new Error(ERROR_MESSAGE_LENGTH);

    return value >= min && value <= max ? true : false;
  }

  static isDate(value: unknown) {
    return value instanceof Date;
  }

  static isUrlValid(value: string): boolean {
    const urlRegex = URL_REGEX_PATTERN;
    return urlRegex.test(value);
  }

  private static getValueLength = (value: number | string | Array<unknown>) =>
    typeof value === 'number' ? Number(value).toString().length : value.length;
}
