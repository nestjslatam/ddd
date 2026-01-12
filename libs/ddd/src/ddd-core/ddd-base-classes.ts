/**
 * Represents a domain entity in the DDD (Domain-Driven Design) architecture.
 * A domain entity is an object that is uniquely identifiable and has its own lifecycle.
 * It encapsulates the business logic and behavior of a specific domain concept.
 *
 * @template TProps - The type of the properties of the domain entity.
 */
import { DomainObjectHelper } from '../ddd-helpers';
import { ValueObjectValidator } from './ddd-validators';
import { BrokenRulesException } from '../ddd-exceptions';
import {
  BrokenRule,
  BrokenRuleCollection,
  ITrackingProps,
  TrackingProps,
} from './';

import { DomainUid } from '../ddd-valueobjects';

/**
 * Represents the properties required to create a domain entity.
 *
 * @template T - The type of the properties of the domain entity.
 */
export interface IDomainEntityProps<T> {
  id: DomainUid;
  props: T;
  trackingProps: TrackingProps;
}

/**
 * Abstract class representing a domain entity.
 *
 * @template TProps - The type of the properties of the domain entity.
 */
export abstract class DomainEntity<TProps> {
  private _id: DomainUid;
  private _trackingProps: ITrackingProps;
  private _brokenRules: BrokenRuleCollection = new BrokenRuleCollection();
  protected readonly _props: TProps;

  /**
   * Abstract method to define the business rules for the domain entity.
   *
   * @param props - The properties of the domain entity.
   */
  protected abstract businessRules(props: TProps): void;

  /**
   * Creates an instance of DomainEntity.
   *
   * @param id - The unique identifier of the domain entity.
   * @param props - The properties of the domain entity.
   * @param trackingProps - The tracking properties of the domain entity.
   */
  constructor({ id, props, trackingProps }: IDomainEntityProps<TProps>) {
    this.businessRules(props);
    this._id = id;
    this._props = props;
    this._trackingProps = trackingProps;
  }

  /**
   * Retrieves the internal properties of the domain entity.
   *
   * @returns The internal properties of the domain entity.
   */
  private getInternalProps() {
    return {
      id: this._id,
      ...this._props,
      ...this.trackingProps,
    };
  }

  /**
   * Retrieves a copy of the properties of the domain entity.
   *
   * @returns A copy of the properties of the domain entity.
   */
  get propsCopy(): TProps & ITrackingProps {
    const propsCopy = this.getInternalProps();

    return Object.freeze(propsCopy);
  }

  /**
   * Retrieves the properties of the domain entity.
   *
   * @returns The properties of the domain entity.
   */
  get props(): TProps & ITrackingProps {
    return this.getInternalProps();
  }

  /**
   * Retrieves the unique identifier of the domain entity.
   *
   * @returns The unique identifier of the domain entity.
   */
  get id(): string {
    return this._id.unpack();
  }

  /**
   * Retrieves the tracking properties of the domain entity.
   *
   * @returns The tracking properties of the domain entity.
   */
  get trackingProps(): ITrackingProps {
    return this._trackingProps;
  }

  /**
   * Checks if the domain entity is valid.
   *
   * @returns True if the domain entity is valid, false otherwise.
   */
  get IsValid(): boolean {
    return this._brokenRules.getItems().length === 0;
  }

  /**
   * Retrieves the collection of broken rules for the domain entity.
   *
   * @returns The collection of broken rules for the domain entity.
   */
  get BrokenRules(): BrokenRuleCollection {
    return this._brokenRules;
  }

  /**
   * Checks if the current domain entity is equal to the specified object.
   *
   * @param object - The object to compare.
   * @returns True if the objects are equal, false otherwise.
   * @remarks This method should be improved to not allow null or undefined IDs.
   */
  protected equals(object?: DomainEntity<TProps>): boolean {
    if (this === object) return true;

    if (
      object === null ||
      object === undefined ||
      !DomainObjectHelper.isDomainEntity(object)
    )
      return false;

    return this._id ? this._id.equals(object._id) : false;
  }

  /**
   * Converts the domain entity to a plain object.
   *
   * @returns The plain object representation of the domain entity.
   */
  toObject(): unknown {
    const plainProps = DomainObjectHelper.convertPropsToObject(this._props);

    const result = {
      id: this._id,
      ...this.trackingProps,
      ...plainProps,
    };

    return Object.freeze(result);
  }

  /**
   * Marks the domain entity as new.
   */
  markAsNew() {
    this._trackingProps = TrackingProps.setNew();
  }

  /**
   * Marks the domain entity as dirty.
   */
  markAsDirty() {
    this._trackingProps = TrackingProps.setDirty();
  }

  /**
   * Marks the domain entity as deleted.
   */
  markAsDeleted() {
    this._trackingProps = TrackingProps.setDeleted();
  }

  /**
   * Adds a broken rule to the domain entity.
   *
   * @param brokenRule - The broken rule to add.
   */
  addBrokenRule(brokenRule: BrokenRule): void {
    this._brokenRules.add(brokenRule);
  }

  /**
   * Removes a broken rule from the domain entity.
   *
   * @param brokenRule - The broken rule to remove.
   */
  removeBrokenRule(brokenRule: BrokenRule): void {
    this._brokenRules.remove(brokenRule);
  }

  /**
   * Validates the domain entity by clearing the broken rules and reapplying the business rules.
   */
  protected validate(): void {
    this._brokenRules.clear();

    this.businessRules(this._props);
  }

  /**
   * @method removeChild
   * @description Removes a child from a collection of children.
   * @param {TParent} parent - The parent entity.
   * @param {TChild} child - The child to remove.
   * @param {Array<TChild>} childs - The collection of children.
   * @returns {Array<TChild>} The updated collection of children.
   * @remarks This method is a temporary solution and should be refactored to a more generic and robust approach.
   * For example, it could be moved to a collection class that handles its own items.
   */
  public removeChild<
    TParent extends DomainEntity<any>,
    TChild extends AbstractDomainValueObject<any> | DomainEntity<any>,
  >(parent: TParent, child: TChild, childs: Array<TChild>): Array<TChild> {
    if (!childs) childs = [];

    // Use entity equality for DomainEntity, reference equality for ValueObjects
    const index = DomainObjectHelper.isDomainEntity(child)
      ? childs.findIndex(
        (c) =>
          DomainObjectHelper.isDomainEntity(c) &&
          (c as DomainEntity<any>).id === (child as DomainEntity<any>).id,
      )
      : childs.indexOf(child);

    if (index > -1) {
      childs.splice(index, 1);
    } else {
      parent._brokenRules.add(new BrokenRule('Child', 'Child not found'));
    }

    return childs;
  }

  /**
   * @method addChild
   * @description Adds a child to a collection of children.
   * @param {TParent} parent - The parent entity.
   * @param {TChild} child - The child to add.
   * @param {Array<TChild>} childs - The collection of children.
   * @returns {Array<TChild>} The updated collection of children.
   * @remarks This method is a temporary solution and should be refactored to a more generic and robust approach.
   * For example, it could be moved to a collection class that handles its own items.
   */
  public addChild<
    TParent extends DomainEntity<any>,
    TChild extends AbstractDomainValueObject<any> | DomainEntity<any>,
  >(parent: TParent, child: TChild, childs: Array<TChild>): Array<TChild> {
    if (!childs) childs = [];

    // Use entity equality for DomainEntity, reference equality for ValueObjects
    const exists = DomainObjectHelper.isDomainEntity(child)
      ? childs.some(
        (c) =>
          DomainObjectHelper.isDomainEntity(c) &&
          (c as DomainEntity<any>).id === (child as DomainEntity<any>).id,
      )
      : childs.includes(child);

    if (exists) {
      parent._brokenRules.add(new BrokenRule('Child', 'Child already exists'));
      return childs;
    }

    childs.push(child);

    return childs;
  }
}

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
  constructor(props: Props<T>) {
    this.guard(props);

    // Only execute business rules if guard didn't find issues
    // This prevents errors when props is undefined or invalid
    if (
      this._brokenRules.getItems().length === 0 &&
      props !== undefined &&
      props !== null
    ) {
      this.businessRules(props);
    }

    // Fail fast - don't create invalid value objects
    if (!this.isValid) {
      throw new BrokenRulesException(
        `Invalid value object ${this.constructor.name
        }: ${this._brokenRules.asString()}`,
      );
    }

    this._props = props;
  }

  /**
   * Gets a value indicating whether the value object is valid or not.
   */
  get isValid(): boolean {
    return this._brokenRules.getItems().length === 0;
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
    if (object === null || object === undefined) {
      return false;
    }

    if (object.constructor.name !== this.constructor.name) {
      return false;
    }

    return JSON.stringify(this._props) === JSON.stringify(object._props);
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
      return (this._props as IDomainPrimitive<T & (Primitives | Date)>)
        .value as T;
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
    // Check if props is undefined or null first
    if (props === undefined || props === null) {
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Props cannot be undefined'),
      );
      return; // Early return to avoid further checks
    }

    // Check if props is not an object (primitive types)
    if (ValueObjectValidator.isNotAndObject(props)) {
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Props cannot be undefined'),
      );
      return; // Early return to avoid further checks
    }

    // Check if props is empty
    if (ValueObjectValidator.isEmptyProps(props)) {
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'Props cannot be empty'),
      );
    }
  }
}
