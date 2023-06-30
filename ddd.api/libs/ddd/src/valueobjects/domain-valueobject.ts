import {
  DomainValueObjectProps,
  IDomainPrimitive,
  DomainPrimitiveType,
} from '../interfaces';
import { DomainGuard, convertPropsToObject } from '../helpers';
import { BrokenRule, BrokenRuleCollection } from '../models';
import { DomainException } from '../exceptions';

export abstract class DomainValueObject<T> {
  protected readonly props: DomainValueObjectProps<T>;

  private _brokenRules: BrokenRuleCollection;

  protected abstract validate(props: DomainValueObjectProps<T>): void;

  constructor(props: DomainValueObjectProps<T>) {
    this._brokenRules = new BrokenRuleCollection();

    this.checkIfEmpty(props);
    this.validate(props);

    if (this._brokenRules.hasBrokenRules)
      throw new DomainException(this._brokenRules);

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

  private checkIfEmpty(props: DomainValueObjectProps<T>): void {
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
  ): obj is IDomainPrimitive<T & (DomainPrimitiveType | Date)> {
    if (!obj)
      this._brokenRules.add(
        new BrokenRule(this.constructor.name, 'Object cannot be null'),
      );

    return Object.prototype.hasOwnProperty.call(obj, 'value') ? true : false;
  }
}
