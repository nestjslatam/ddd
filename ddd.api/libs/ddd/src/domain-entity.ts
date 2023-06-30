import { DateTimeHelper, DomainGuard, convertPropsToObject } from './helpers';
import { IDomainEntityProps, IDomainTrackingStatusProps } from './interfaces';
import { DomainAuditValueObject, DomainIdValueObject } from './valueobjects';
import { BrokenRule, BrokenRuleCollection } from './models';
import { DomainException } from './exceptions';

export abstract class DomainEntity<TDomainEntityProps> {
  private _id: DomainIdValueObject;
  private _props: TDomainEntityProps;
  private _trackingStatus: IDomainTrackingStatusProps;
  private _audit: DomainAuditValueObject;
  private _brokenRules: BrokenRuleCollection;

  constructor({ id, props, audit }: IDomainEntityProps<TDomainEntityProps>) {
    this.guard(props);

    if (this._brokenRules) throw new DomainException(this._brokenRules);

    this._id = id;
    this._brokenRules = new BrokenRuleCollection();
    this._props = props;
    this._audit = audit;

    this._trackingStatus = { ...this._trackingStatus, isNew: true };
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

  markAsNew(entity: DomainEntity<TDomainEntityProps>) {
    entity._trackingStatus = {
      ...this._trackingStatus,
      isNew: true,
      isDirty: false,
      isDeleted: false,
    };

    entity._audit = DomainAuditValueObject.create(
      'TODO',
      DateTimeHelper.getUtcDate(),
    );
  }

  marAsDirty(entity: DomainEntity<TDomainEntityProps>) {
    entity._trackingStatus = {
      ...this._trackingStatus,
      isNew: true,
      isDirty: true,
      isDeleted: false,
    };

    entity._audit.update('TODO', DateTimeHelper.getUtcDate());
  }

  getTrackingStatus(): IDomainTrackingStatusProps {
    return this._trackingStatus;
  }

  getIsValid(): boolean {
    return !this._brokenRules.hasBrokenRules();
  }

  equals(object?: DomainEntity<TDomainEntityProps>): boolean {
    if (this === object) return true;

    if (
      object === null ||
      object === undefined ||
      !DomainEntity.isEntity(object)
    )
      return false;

    return this._id.equals(object._id);
  }

  protected getProps(): TDomainEntityProps & IDomainTrackingStatusProps {
    const propsCopy = {
      id: this._id,
      ...this._props,
      audit: this._audit,
      ...this._trackingStatus,
    };

    return propsCopy;
  }

  getPropsCopy(): TDomainEntityProps & IDomainTrackingStatusProps {
    const propsCopy = {
      id: this._id,
      ...this._props,
      audit: this._audit,
      ...this._trackingStatus,
    };

    return Object.freeze(propsCopy);
  }

  toObject(): unknown {
    const props = convertPropsToObject(this._props);
    const obj = { ...props };
    return Object.freeze(obj);
  }

  private guard(props: TDomainEntityProps): void {
    if (DomainGuard.isEmpty(props))
      this._brokenRules.add(new BrokenRule('props', 'Props is required'));

    if (typeof props !== 'object')
      this._brokenRules.add(new BrokenRule('props', 'Props is not an object'));
  }

  static isEntity(entity: unknown): entity is DomainEntity<unknown> {
    return entity instanceof DomainEntity;
  }

  setId(id: string): void {
    this._id = DomainIdValueObject.setValue(id);
  }

  getId(): string {
    return this._id.unpack();
  }
}
