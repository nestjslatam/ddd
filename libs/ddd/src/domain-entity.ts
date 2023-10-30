import { DomainGuard, convertPropsToObject } from './helpers';
import { DomainAuditValueObject, DomainUIdValueObject } from './valueobjects';
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
  audit: DomainAuditValueObject;
}

export type DomainEntityId = DomainUIdValueObject;

export abstract class DomainEntity<TProps> {
  private _id: DomainEntityId;
  private _isValid: boolean;
  private _trackingProps: ITrackingProps;
  private _audit: DomainAuditValueObject;
  private _brokenRules: BrokenRuleCollection = new BrokenRuleCollection();

  protected abstract businessRules(props: TProps): void;

  constructor({ id, props, trackingProps, audit }: IDomainEntityProps<TProps>) {
    this.guard(props);
    this.businessRules(props);

    this._isValid = this._brokenRules.getItems().length ? true : false;

    this._id = id;
    this.props = props;

    this.setAudit(audit);

    this.setTrackingProps(trackingProps);
  }

  // Let's edit the props with new values
  protected readonly props: TProps;

  getId(): string {
    return this._id.unpack();
  }

  setAudit(audit: DomainAuditValueObject): void {
    this._audit = audit;
  }

  getAudit(): DomainAuditValueObject {
    return this._audit;
  }

  setTrackingProps(trackingProps: ITrackingProps): void {
    this._trackingProps = trackingProps;
  }

  getTrackingProps(): ITrackingProps {
    return this._trackingProps;
  }

  getIsValid(): boolean {
    return this._isValid;
  }

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
    let result = '';

    this._brokenRules.getItems().map((brokenRule) => {
      result += `${brokenRule.code}-${brokenRule.description}`;
    });

    return result;
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

  getPropsCopy(): TProps & ITrackingProps {
    const propsCopy = {
      id: this._id,
      ...this.props,
      audit: this._audit,
      ...this.getTrackingProps(),
    };

    return Object.freeze(propsCopy);
  }

  toObject(): unknown {
    const plainProps = convertPropsToObject(this.props);

    const result = {
      id: this._id,
      audit: this._audit,
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

  private guard(props: TProps): void {
    if (DomainGuard.isEmpty(props))
      this._brokenRules.add(new BrokenRule('props', 'Props is required'));

    if (typeof props !== 'object')
      this._brokenRules.add(new BrokenRule('props', 'Props is not an object'));
  }
}
