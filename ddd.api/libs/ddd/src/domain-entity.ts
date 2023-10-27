import { DomainGuard, convertPropsToObject } from './helpers';
import { DomainAuditValueObject, DomainUIdValueObject } from './valueobjects';
import { BrokenRule, BrokenRuleCollection, ITrackingProps } from './core';

export interface IDomainEntityProps<T> {
  id: DomainEntityId;
  props: T;
  audit: DomainAuditValueObject;
}

export type DomainEntityId = DomainUIdValueObject;

export abstract class DomainEntity<TProps> {
  private _id: DomainEntityId;
  private _isValid: boolean;
  private _trackingStatus: ITrackingProps;
  private _audit: DomainAuditValueObject;
  private _brokenRules: BrokenRuleCollection = new BrokenRuleCollection();

  protected abstract businessRules(props: TProps): void;

  constructor({ id, props, audit }: IDomainEntityProps<TProps>) {
    this.guard(props);
    this.businessRules(props);
    this._isValid = this._brokenRules.getItems().length ? true : false;

    this._id = id;
    this.props = props;
    this._audit = audit;

    this.markAsNew(this);
  }

  getId(): string {
    return this._id.unpack();
  }

  protected readonly props: TProps;

  getIsValid(): boolean {
    return this._isValid;
  }

  getAudit(): DomainAuditValueObject {
    return this._audit;
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

  markAsNew(entity: DomainEntity<TProps>) {
    entity._trackingStatus = {
      ...this._trackingStatus,
      isNew: true,
      isDirty: false,
      isDeleted: false,
    };
  }

  marAsDirty(entity: DomainEntity<TProps>) {
    entity._trackingStatus = {
      ...this._trackingStatus,
      isNew: true,
      isDirty: true,
      isDeleted: false,
    };
  }

  getTrackingStatus(): ITrackingProps {
    return this._trackingStatus;
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
      ...this._trackingStatus,
    };

    return Object.freeze(propsCopy);
  }

  toObject(): unknown {
    const plainProps = convertPropsToObject(this.props);

    const result = {
      id: this._id,
      audit: this._audit,
      ...this._trackingStatus,
      ...plainProps,
    };

    return Object.freeze(result);
  }

  private guard(props: TProps): void {
    if (DomainGuard.isEmpty(props))
      this._brokenRules.add(new BrokenRule('props', 'Props is required'));

    if (typeof props !== 'object')
      this._brokenRules.add(new BrokenRule('props', 'Props is not an object'));
  }
}
