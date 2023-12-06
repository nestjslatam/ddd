import { AbstractValidator } from './domain-abstract.validator';
import { BrokenRule, BrokenRuleCollection } from '../../ddd-core';
import {
  AbstractDomainValueObject,
  IDomainPrimitive,
  Primitives,
} from '../../ddd-valueobject';

export const GUARD_ERROR_MESSAGE_LENGTH =
  'Cannot check length of a value. Provided value is empty';

export class ValueObjectValidator extends AbstractValidator {
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

  static isInstanceOf(obj: any): boolean {
    if (obj === null || obj === undefined) return false;

    if (typeof obj === 'string' || typeof obj === 'boolean') return false;

    const canConvert = obj as AbstractDomainValueObject<unknown>;

    return !!canConvert;
  }

  static equals<T>(object?: AbstractDomainValueObject<T>): boolean {
    if (object === null || object === undefined) return false;

    return JSON.stringify(this) === JSON.stringify(object);
  }

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
