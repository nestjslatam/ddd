/**
 * AbstractValidator is an abstract class that provides common validation methods.
 */
export abstract class AbstractValidator {
  /**
   * Checks if the given value is not an object.
   * @param value - The value to check.
   * @returns Returns true if the value is not an object, otherwise returns false.
   */
  static isNotAndObject(value: unknown): boolean {
    return typeof value !== 'object';
  }

  /**
   * Checks if the given value is undefined or null.
   * @param value - The value to check.
   * @returns Returns true if the value is undefined or null, otherwise returns false.
   */
  static isUndefinedOrNull(value: unknown): boolean {
    return typeof value === 'undefined' || value === null;
  }

  /**
   * Checks if the given props object is empty.
   * @param props - The props object to check.
   * @returns Returns true if the props object is empty, otherwise returns false.
   */
  static isEmptyProps(props: unknown): boolean {
    if (this.isUndefinedOrNull(props)) return false;

    if (
      typeof props === 'number' ||
      typeof props === 'boolean' ||
      props instanceof Date
    )
      return false;

    if (
      typeof props === 'undefined' ||
      props === null ||
      (props instanceof Object && !Object.keys(props).length) ||
      props === ''
    )
      return true;

    if (Array.isArray(props)) {
      if (props.length === 0) return true;

      if (props.every((item) => this.isEmptyProps(item))) {
        return true;
      }
    }

    return false;
  }
}

import { BrokenRule, BrokenRuleCollection } from './broken-rules';
import { AbstractDomainValueObject, IDomainPrimitive, Primitives } from './ddd-base-classes';

/**
 * Error message for guard length check.
 */
export const GUARD_ERROR_MESSAGE_LENGTH =
  'Cannot check length of a value. Provided value is empty';

/**
 * Validator for value objects.
 */
export class ValueObjectValidator extends AbstractValidator {
  /**
   * Validates the properties of a value object.
   * @param props - The properties to be validated.
   * @returns A collection of broken rules.
   */
  static validate<T>(props: T): BrokenRuleCollection {
    const brokenRules = new BrokenRuleCollection();

    if (!this.isNotAndObject(props))
      if (this.isUndefinedOrNull(props))
        brokenRules.add(
          new BrokenRule(this.constructor.name, 'Props cannot be undefined'),
        );

    if (!this.isEmptyProps(props))
      brokenRules.add(
        new BrokenRule(this.constructor.name, 'Props cannot be empty'),
      );

    return brokenRules;
  }

  /**
   * Checks if an object is an instance of a value object.
   * @param obj - The object to be checked.
   * @returns True if the object is an instance of a value object, false otherwise.
   */
  static isInstanceOf(obj: any): boolean {
    if (obj === null || obj === undefined) return false;

    if (typeof obj === 'string' || typeof obj === 'boolean') return false;

    const canConvert = obj as AbstractDomainValueObject<unknown>;

    return !!canConvert;
  }

  /**
   * Checks if two value objects are equal.
   * @param object - The value object to compare.
   * @returns True if the value objects are equal, false otherwise.
   */
  static equals<T>(object?: AbstractDomainValueObject<T>): boolean {
    if (object === null || object === undefined) return false;

    return JSON.stringify(this) === JSON.stringify(object);
  }

  /**
   * Checks if an object is a value object.
   * @param obj - The object to be checked.
   * @returns True if the object is a value object, false otherwise.
   */
  static isValueObject(
    obj: unknown,
  ): obj is AbstractDomainValueObject<unknown> {
    return obj instanceof AbstractDomainValueObject;
  }  static isDomainPrimitive<T>(
    obj: unknown,
  ): obj is IDomainPrimitive<T & (Primitives | Date)> {
    if (!obj) return false;

    return Object.prototype.hasOwnProperty.call(obj, 'value') ? true : false;
  }
}
