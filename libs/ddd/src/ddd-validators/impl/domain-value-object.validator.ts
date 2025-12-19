/**
 * Validates a domain value object.
 */
import { AbstractValidator } from './domain-abstract.validator';
import { BrokenRule, BrokenRuleCollection } from '../../ddd-core';
import {
  AbstractDomainValueObject,
  IDomainPrimitive,
  Primitives,
} from '../../ddd-core/ddd-base-classes';

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
  }
  static isDomainPrimitive<T>(
    obj: unknown,
  ): obj is IDomainPrimitive<T & (Primitives | Date)> {
    if (!obj) return false;

    return Object.prototype.hasOwnProperty.call(obj, 'value') ? true : false;
  }
}
