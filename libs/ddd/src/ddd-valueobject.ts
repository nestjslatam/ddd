import { BrokenRule, BrokenRuleCollection } from './ddd-core';
import { ValueObjectValidator } from './ddd-validators';
import { DomainObjectHelper } from './ddd-helpers';

/**
 * Represents the properties required to create a domain value object.
 */
export type Primitives = string | number | boolean;

/**
 * Represents the properties required to create a domain value object.
 */
export type Props<T> = T extends Primitives | Date ? IDomainPrimitive<T> : T;

/**
 * Represents the properties required to create a domain value object.
 */
export interface IDomainPrimitive<T extends Primitives | Date> {
  value: T;
}

/**
 * Abstract class representing a domain value object.
 *
 * @template T - The type of the properties of the value object.
 */
export abstract class AbstractDomainValueObject<T> {
  /**
   * The properties of the value object.
   */
  protected readonly _props: Props<T>;

  /**
   * The collection of broken rules associated with the value object.
   */
  private _brokenRules: BrokenRuleCollection = new BrokenRuleCollection();

  /**
   * Indicates whether the value object is valid or not.
   */
  private _isValid: boolean = true;

  constructor(props: Props<T>) {
    this.guard(props);
    this.businessRules(props);
    this._isValid = !!this._brokenRules.getItems().length;
    this._props = props;
  }

  /**
   * Gets a value indicating whether the value object is valid or not.
   */
  get isValid(): boolean {
    return this._isValid;
  }

  /**
   * Gets the collection of broken rules associated with the value object.
   */
  get getBrokenRules(): BrokenRuleCollection {
    return this._brokenRules;
  }

  /**
   * Adds a broken rule to the collection of broken rules.
   *
   * @param brokenRule - The broken rule to add.
   */
  addBrokenRule(brokenRule: BrokenRule): void {
    this._brokenRules.add(brokenRule);
  }

  /**
   * Removes a broken rule from the collection of broken rules.
   *
   * @param brokenRule - The broken rule to remove.
   */
  removeBrokenRule(brokenRule: BrokenRule): void {
    this._brokenRules.remove(brokenRule);
  }

  /**
   * Checks if the value object is equal to another value object.
   *
   * @param object - The value object to compare.
   * @returns True if the value objects are equal, false otherwise.
   */
  equals(object?: AbstractDomainValueObject<T>): boolean {
    return ValueObjectValidator.equals(object);
  }

  /**
   * Checks if an object is a value object.
   *
   * @param obj - The object to check.
   * @returns True if the object is a value object, false otherwise.
   */
  isValueObject(obj: unknown): obj is AbstractDomainValueObject<unknown> {
    return ValueObjectValidator.isValueObject(obj);
  }

  /**
   * Unpacks the value object and returns its underlying value.
   *
   * @returns The underlying value of the value object.
   */
  unpack(): T {
    if (ValueObjectValidator.isDomainPrimitive<T>(this._props)) {
      return this._props.value;
    }

    const propsCopy = DomainObjectHelper.convertPropsToObject(this._props);

    return Object.freeze(propsCopy);
  }

  /**
   * Validates the properties of the value object and adds any broken rules.
   *
   * @param props - The properties of the value object.
   */
  protected abstract businessRules(props: Props<T>): void;

  /**
   * Guards against invalid properties and adds any broken rules.
   *
   * @param props - The properties of the value object.
   */
  private guard(props: Props<T>): void {
    if (ValueObjectValidator.isNotAndObject(props))
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Props cannot be undefined'),
      );

    if (ValueObjectValidator.isEmptyProps(props))
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Props cannot be empty'),
      );
  }
}
