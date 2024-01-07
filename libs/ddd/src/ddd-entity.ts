import { DomainObjectHelper } from './ddd-helpers';
import {
  BrokenRule,
  BrokenRuleCollection,
  ITrackingProps,
  TrackingProps,
} from './ddd-core';

import { DomainIdAsString } from './ddd-valueobjects';
import { AbstractDomainValueObject } from './ddd-valueobject';

export interface IDomainEntityProps<T> {
  id: DomainIdAsString;
  props: T;
  trackingProps: TrackingProps;
}

export abstract class DomainEntity<TProps> {
  private _id: DomainIdAsString;
  private _trackingProps: ITrackingProps;
  private _brokenRules: BrokenRuleCollection = new BrokenRuleCollection();

  protected readonly props: TProps;

  protected abstract businessRules(props: TProps): void;

  constructor({ id, props, trackingProps }: IDomainEntityProps<TProps>) {
    this.businessRules(props);

    this._id = id;
    this.props = props;

    this.setTrackingProps(trackingProps);
  }

  getPropsCopy(): TProps & ITrackingProps {
    const propsCopy = {
      id: this._id,
      ...this.props,
      ...this.getTrackingProps(),
    };

    return Object.freeze(propsCopy);
  }

  getProps(): TProps & ITrackingProps {
    const props = {
      id: this._id,
      ...this.props,
      ...this.getTrackingProps(),
    };

    return props;
  }

  setId(id: DomainIdAsString): void {
    this._id = id;
  }

  getId(): string {
    return this._id.unpack();
  }

  setTrackingProps(trackingProps: ITrackingProps): void {
    this._trackingProps = trackingProps;
  }

  getTrackingProps(): ITrackingProps {
    return this._trackingProps;
  }

  getIsValid(): boolean {
    return this._brokenRules.getItems().length === 0;
  }

  getBrokenRules(): BrokenRuleCollection {
    return this._brokenRules;
  }

  static isEntity(entity: unknown): entity is DomainEntity<unknown> {
    return entity instanceof DomainEntity;
  }

  equals(object?: DomainEntity<TProps>): boolean {
    if (this === object) return true;

    if (
      object === null ||
      object === undefined ||
      !DomainEntity.isEntity(object)
    )
      return false;

    return this._id ? this._id.equals(object._id) : false;
  }

  toObject(): unknown {
    const plainProps = DomainObjectHelper.convertPropsToObject(this.props);

    const result = {
      id: this._id,
      ...this.getTrackingProps(),
      ...plainProps,
    };

    return Object.freeze(result);
  }

  markAsNew() {
    this._trackingProps = TrackingProps.setNew();
  }

  markAsDirty() {
    this._trackingProps = TrackingProps.setDirty();
  }

  markAsDeleted() {
    this._trackingProps = TrackingProps.setDeleted();
  }

  addBrokenRule(brokenRule: BrokenRule): void {
    this._brokenRules.add(brokenRule);
  }

  removeBrokenRule(brokenRule: BrokenRule): void {
    this._brokenRules.remove(brokenRule);
  }

  validate(): void {
    this._brokenRules.clear();

    this.businessRules(this.props);
  }

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

  public addChild<
    TParent extends DomainEntity<any>,
    TChild extends AbstractDomainValueObject<any> | DomainEntity<any>,
  >(parent: TParent, child: TChild, childs: Array<TChild>): Array<TChild> {
    if (!childs) childs = [];

    if (childs.includes(child)) {
      parent._brokenRules.add(new BrokenRule('Child', 'Child already exists'));
    }

    childs.push(child);

    return childs;
  }
}
