/**
 * Represents a domain entity in the DDD (Domain-Driven Design) architecture.
 * A domain entity is an object that is uniquely identifiable and has its own lifecycle.
 * It encapsulates the business logic and behavior of a specific domain concept.
 *
 * @template TProps - The type of the properties of the domain entity.
 */
import { DomainObjectHelper } from './ddd-helpers';
import {
  BrokenRule,
  BrokenRuleCollection,
  ITrackingProps,
  TrackingProps,
} from './ddd-core';

import { DomainIdAsString } from './ddd-valueobjects';
import { AbstractDomainValueObject } from './ddd-valueobject';

/**
 * Represents the properties required to create a domain entity.
 *
 * @template T - The type of the properties of the domain entity.
 */
export interface IDomainEntityProps<T> {
  id: DomainIdAsString;
  props: T;
  trackingProps: TrackingProps;
}

/**
 * Abstract class representing a domain entity.
 *
 * @template TProps - The type of the properties of the domain entity.
 */
export abstract class DomainEntity<TProps> {
  private _id: DomainIdAsString;
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
    this.trackingProps = trackingProps;
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
   * Sets the unique identifier of the domain entity.
   *
   * @param id - The unique identifier to set.
   */
  set id(id: DomainIdAsString) {
    this._id = id;
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
   * Sets the tracking properties of the domain entity.
   *
   * @param trackingProps - The tracking properties to set.
   */
  set trackingProps(trackingProps: ITrackingProps) {
    this._trackingProps = trackingProps;
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

  //TODO: Refactor this to a generic method
  public removeChild<
    TParent extends DomainEntity<any>,
    TChild extends AbstractDomainValueObject<any> | DomainEntity<any>,
  >(parent: TParent, child: TChild, childs: Array<TChild>): Array<TChild> {
    if (!childs) childs = [];

    const index = childs.indexOf(child);

    if (index > -1) {
      childs.splice(index, 1);
    } else {
      parent._brokenRules.add(new BrokenRule('Child', 'Child not found'));
    }

    return childs;
  }

  //TODO: Refactor this to a generic method
  public addChild<
    TParent extends DomainEntity<any>,
    TChild extends AbstractDomainValueObject<any> | DomainEntity<any>,
  >(parent: TParent, child: TChild, childs: Array<TChild>): Array<TChild> {
    if (!childs) childs = [];

    if (childs.includes(child))
      parent._brokenRules.add(new BrokenRule('Child', 'Child already exists'));

    childs.push(child);

    return childs;
  }
}
