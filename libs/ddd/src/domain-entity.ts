import { DomainGuard, convertPropsToObject } from './helpers';
import { DomainUIdValueObject, DomainValueObject } from './valueobjects';
import {
  BrokenRule,
  BrokenRuleCollection,
  ITrackingProps,
  TrackingProps,
} from './core';

export interface IDomainEntityProps<T> {
  id: DomainEntityId;
  props: T;
  trackingProps: TrackingProps;
}

export type DomainEntityId = DomainUIdValueObject;

export abstract class DomainEntity<TProps> {
  private _id: DomainEntityId;
  private _trackingProps: ITrackingProps;
  private _brokenRules: BrokenRuleCollection = new BrokenRuleCollection();

  constructor({ id, props, trackingProps }: IDomainEntityProps<TProps>) {
    this.guard(props);
    this.businessRules(props);

    this._id = id;
    this.props = props;

    this.setTrackingProps(trackingProps);
  }

  // NOTE: Props ----------------------------------------------------------------

  protected readonly props: TProps;

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

  setId(id: DomainEntityId): void {
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
    return this._brokenRules.getItems().length === 0 ? true : false;
  }

  // NOTE: Broken Rules ---------------------------------------------------------

  protected abstract businessRules(props: TProps): void;

  addBrokenRule(brokenRule: BrokenRule): void {
    if (!brokenRule) return;

    this._brokenRules.add(brokenRule);
  }

  removeBrokenRule(brokenRule: BrokenRule): void {
    if (!brokenRule) return;

    this._brokenRules.remove(brokenRule);
  }

  getBrokenRules(): Array<BrokenRule> {
    return this._brokenRules.getItems();
  }

  getBrokenRulesAsString(): string {
    return this._brokenRules.getBrokenRulesAsString();
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
    const plainProps = convertPropsToObject(this.props);

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

  // NOTE: Guard ----------------------------------------------------------------

  private guard(props: TProps): void {
    this._brokenRules.clear();

    if (props === undefined) throw new Error('props is undefined');

    if (DomainGuard.isEmpty(props))
      this._brokenRules.add(new BrokenRule('props', 'Props is required'));

    if (typeof props !== 'object')
      this._brokenRules.add(new BrokenRule('props', 'Props is not an object'));

    this.childGuard(props);
  }

  // NOTE: Child Properties ---------------------------------------------------

  private childGuard(props: TProps): void {
    if (!props || props === undefined) throw new Error('props is undefined');

    Object.keys(props).forEach((key) => {
      const prop = props[key];

      const isValueObject = DomainGuard.isInstanceOfValueObject(prop);

      if (isValueObject) {
        const brokenRules = props[key].getBrokenRules();
        brokenRules.forEach((brokenRule) => this.addBrokenRule(brokenRule));
      }
    });
  }

  removeChild<
    TParent extends DomainEntity<any>,
    TChild extends DomainValueObject<any> | DomainEntity<any>,
  >(parent: TParent, child: TChild, childs: Array<TChild>): Array<TChild> {
    if (!childs) childs = [];

    const index = childs.indexOf(child);

    if (index > -1) {
      childs.splice(index, 1);
    } else {
      parent.addBrokenRule(new BrokenRule('Child', 'Child not found'));
    }

    return childs;
  }

  addChild<
    TParent extends DomainEntity<any>,
    TChild extends DomainValueObject<any> | DomainEntity<any>,
  >(parent: TParent, child: TChild, childs: Array<TChild>): Array<TChild> {
    if (!childs) childs = [];

    if (childs.includes(child)) {
      parent.addBrokenRule(new BrokenRule('Child', 'Child already exists'));
    }

    childs.push(child);

    return childs;
  }
  // --------------------------------------------------------------------------
}
