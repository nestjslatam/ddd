import { DomainGuard, convertPropsToObject } from './helpers';
import { DomainAuditValueObject, DomainUIdValueObject } from './valueobjects';
import { BrokenRule, BrokenRuleCollection } from './models';
import { DomainException } from './exceptions';

export interface ITrackingProps {
  isDirty: boolean;
  isNew: boolean;
  isDeleted: boolean;
}

export interface IProps<T> {
  id: DomainUIdValueObject;
  props: T;
  audit: DomainAuditValueObject;
}

export abstract class DomainEntity<TProps> {
  private _id: DomainUIdValueObject;
  private _props: TProps;
  private _trackingStatus: ITrackingProps;
  private _audit: DomainAuditValueObject;
  private _brokenRules: BrokenRuleCollection;

  protected abstract businessRules(props: TProps): void;

  constructor({ id, props, audit }: IProps<TProps>) {
    this.guard(props);
    this.businessRules(props);

    if (this._brokenRules.hasBrokenRules())
      throw new DomainException(this._brokenRules.getItems());

    this._id = id;
    this._brokenRules = new BrokenRuleCollection();
    this._props = props;
    this._audit = audit;

    this.markAsNew(this);
  }

  getAudit(): DomainAuditValueObject {
    return this._audit;
  }

  addBrokenRule(brokenRule: BrokenRule): void {
    this._brokenRules.add(brokenRule);
  }

  removeBrokenRule(brokenRule: BrokenRule): void {
    this._brokenRules.remove(brokenRule);
  }

  getBrokenRules(): Array<BrokenRule> {
    return this._brokenRules.getItems();
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

  getIsValid(): boolean {
    return !this._brokenRules.hasBrokenRules();
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

    return this._id.equals(object._id);
  }

  protected getProps(): TProps & ITrackingProps {
    const propsCopy = {
      id: this._id,
      ...this._props,
      audit: this._audit,
      ...this._trackingStatus,
    };

    return propsCopy;
  }

  getPropsCopy(): TProps & ITrackingProps {
    const propsCopy = this.getProps();

    return Object.freeze(propsCopy);
  }

  toObject(): unknown {
    const plainProps = convertPropsToObject(this._props);

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

  getId(): string {
    return this._id.unpack();
  }
}
