import { BrokenRule, BrokenRuleCollection } from './ddd-core';
import { ValueObjectValidator } from './ddd-validators';
import { DomainObjectHelper } from './ddd-helpers';

//#region Types and Interfaces -------------------------------------------------
export type Primitives = string | number | boolean;

export type Props<T> = T extends Primitives | Date ? IDomainPrimitive<T> : T;

export interface IDomainPrimitive<T extends Primitives | Date> {
  value: T;
}
//#endregion ------------------------------------------------------------------

export abstract class AbstractDomainValueObject<T> {
  //#region Properties --------------------------------------------------------
  protected readonly props: Props<T>;
  private _brokenRules: BrokenRuleCollection = new BrokenRuleCollection();
  private _isValid: boolean;
  //#endregion ----------------------------------------------------------------

  //#region Abstract Methods -------------------------------------------------
  protected abstract businessRules(props: Props<T>): void;
  //#endregion ----------------------------------------------------------------

  //#region Constructor -------------------------------------------------------
  constructor(props: Props<T>) {
    this._isValid = true;

    this.guard(props);

    this.businessRules(props);

    this._isValid = !!this._brokenRules.getItems().length;

    this.props = props;
  }

  //#endregion ----------------------------------------------------------------

  //#region Getters/Setters ---------------------------------------------------
  public isValid(): boolean {
    return this._isValid;
  }

  public getBrokenRules(): BrokenRuleCollection {
    return this._brokenRules;
  }

  public addBrokenRule(brokenRule: BrokenRule): void {
    this._brokenRules.add(brokenRule);
  }

  public removeBrokenRule(brokenRule: BrokenRule): void {
    this._brokenRules.remove(brokenRule);
  }
  //#endregion ----------------------------------------------------------------

  //#region Behavior ----------------------------------------------------------
  public equals(object?: AbstractDomainValueObject<T>): boolean {
    return ValueObjectValidator.equals(object);
  }

  public isValueObject(
    obj: unknown,
  ): obj is AbstractDomainValueObject<unknown> {
    return ValueObjectValidator.isValueObject(obj);
  }

  public unpack(): T {
    if (ValueObjectValidator.isDomainPrimitive<T>(this.props)) {
      return this.props.value;
    }

    const propsCopy = DomainObjectHelper.convertPropsToObject(this.props);

    return Object.freeze(propsCopy);
  }
  //#endregion ----------------------------------------------------------------

  //#region Guard Methods -----------------------------------------------------
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
  //#endregion ----------------------------------------------------------------
}
