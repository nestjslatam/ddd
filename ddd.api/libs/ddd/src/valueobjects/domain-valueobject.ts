import { DomainGuard, convertPropsToObject } from '../helpers';
import { BrokenRule, BrokenRuleCollection } from '../models';
import { DomainException } from '../exceptions';

type Primitives = string | number | boolean;

type Props<T> = T extends Primitives | Date ? IDomainPrimitive<T> : T;

export interface IDomainPrimitive<T extends Primitives | Date> {
  value: T;
}

export abstract class DomainValueObject<T> {
  protected readonly props: Props<T>;
  private _brokenRules: BrokenRuleCollection;

  protected abstract businessRules(props: Props<T>): void;

  constructor(props: Props<T>) {
    this._brokenRules = new BrokenRuleCollection();

    this.guard(props);
    this.businessRules(props);

    if (this._brokenRules.hasBrokenRules)
      throw new DomainException(this._brokenRules.getItems());

    this.props = props;
  }

  isValid(): boolean {
    return this._brokenRules.hasBrokenRules();
  }

  getBrokenRules(): Array<BrokenRule> {
    return this._brokenRules.getItems();
  }

  addBrokenRule(brokenRule: BrokenRule): void {
    this._brokenRules.add(brokenRule);
  }

  removeBrokenRule(brokenRule: BrokenRule): void {
    this._brokenRules.remove(brokenRule);
  }

  static isValueObject(obj: unknown): obj is DomainValueObject<unknown> {
    return obj instanceof DomainValueObject;
  }

  public equals(object?: DomainValueObject<T>): boolean {
    if (object === null || object === undefined) return false;

    return JSON.stringify(this) === JSON.stringify(object);
  }

  public unpack(): T {
    if (this.isDomainPrimitive(this.props)) {
      return this.props.value;
    }

    const propsCopy = convertPropsToObject(this.props);

    return Object.freeze(propsCopy);
  }

  private guard(props: Props<T>): void {
    if (
      DomainGuard.isEmpty(props) ||
      (this.isDomainPrimitive(props) && DomainGuard.isEmpty(props.value))
    ) {
      this._brokenRules.add(
        new BrokenRule(this.constructor.name, 'Properties cannot be empty'),
      );
    }
  }

  private isDomainPrimitive(
    obj: unknown,
  ): obj is IDomainPrimitive<T & (Primitives | Date)> {
    if (!obj)
      this._brokenRules.add(
        new BrokenRule(this.constructor.name, 'Object cannot be null'),
      );

    return Object.prototype.hasOwnProperty.call(obj, 'value') ? true : false;
  }
}
