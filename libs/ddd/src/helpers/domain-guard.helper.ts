import { DomainValueObject } from '@nestjslatam/ddd-lib';
import {
  ValueObjectGuard,
  GUARD_ERROR_MESSAGE_LENGTH,
  ValueGuard,
} from '../core';

export class DomainGuard {
  static isValueObject(obj: unknown): obj is DomainValueObject<unknown> {
    return obj instanceof DomainValueObject;
  }

  static isInstanceOfValueObject(obj: any): boolean {
    return ValueObjectGuard.isInstanceOfValueObject(obj);
  }

  static isEmpty(value: unknown): boolean {
    return ValueGuard.isEmpty(value);
  }

  static lengthIsBetween(
    value: number | string | Array<unknown>,
    min: number,
    max: number,
  ): boolean {
    return ValueGuard.lengthIsBetween(value, min, max);
  }

  static lenghtIsEqual(
    value: number | string | Array<unknown>,
    length: number,
  ): boolean {
    if (DomainGuard.isEmpty(value)) throw new Error(GUARD_ERROR_MESSAGE_LENGTH);

    return this.getValueLength(value) === length ? true : false;
  }

  static isString(value: unknown) {
    return typeof value === 'string';
  }

  static isNumber(value: unknown) {
    return typeof value === 'number';
  }

  static isDate(value: unknown) {
    return value instanceof Date;
  }

  static isNumberBetween(value: number, min: number, max: number) {
    if (DomainGuard.isEmpty(value)) throw new Error(GUARD_ERROR_MESSAGE_LENGTH);

    return value >= min && value <= max ? true : false;
  }

  private static getValueLength = (value: number | string | Array<unknown>) =>
    typeof value === 'number' ? Number(value).toString().length : value.length;
}
