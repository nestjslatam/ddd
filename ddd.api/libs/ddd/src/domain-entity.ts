import { DomainGuard, convertPropsToObject } from './helpers';
import { DomainAuditValueObject, DomainUuidValueObject } from './valueobjects';

export interface IDomainTrackingProps {
  isDirty: boolean;
  isNew: boolean;
  isDeleted: boolean;
}

export interface IDomainEntityProps<T> {
  id: DomainUuidValueObject;
  props: T;
  audit: DomainAuditValueObject;
}

export abstract class DomainEntity<TDomainEntityProps> {
  private _id: DomainUuidValueObject;
  private _props: TDomainEntityProps;
  private _trackingProps: IDomainTrackingProps;
  private _isValid: boolean;
  public audit: DomainAuditValueObject;

  constructor({ id, props, audit }: IDomainEntityProps<TDomainEntityProps>) {
    this._isValid = true;

    this._id = id;
    this.guard(props);
    this.businessRules();
    this._props = props;
    this.audit = audit;

    this._trackingProps = { ...this._trackingProps, isNew: true };
  }

  markAsNew(entity: DomainEntity<TDomainEntityProps>) {
    entity._trackingProps = {
      ...this._trackingProps,
      isNew: true,
      isDirty: false,
      isDeleted: false,
    };
  }

  marAsDirty(entity: DomainEntity<TDomainEntityProps>) {
    entity._trackingProps = {
      ...this._trackingProps,
      isNew: true,
      isDirty: true,
      isDeleted: false,
    };
  }

  abstract businessRules(): void;

  getPropsTracking(): IDomainTrackingProps {
    return this._trackingProps;
  }

  getIsValid(): boolean {
    return this._isValid;
  }

  equals(object?: DomainEntity<TDomainEntityProps>): boolean {
    if (object === null || object === undefined) return false;

    if (this === object) return true;

    if (!DomainEntity.isEntity(object)) return false;

    return true;
  }

  protected getProps(): TDomainEntityProps & IDomainTrackingProps {
    const propsCopy = {
      id: this._id,
      ...this._props,
      audit: this.audit,
      ...this._trackingProps,
    };

    return propsCopy;
  }

  getPropsCopy(): TDomainEntityProps & IDomainTrackingProps {
    const propsCopy = {
      id: this._id,
      ...this._props,
      audit: this.audit,
      ...this._trackingProps,
    };

    return Object.freeze(propsCopy);
  }

  toObject(): unknown {
    const props = convertPropsToObject(this._props);

    const obj = { ...props };

    return Object.freeze(obj);
  }

  private guard(props: TDomainEntityProps): void {
    if (DomainGuard.isEmpty(props)) {
      this._isValid = false;
      return;
    }

    if (typeof props !== 'object') {
      this._isValid = false;
      return;
    }

    this._isValid = false;
  }

  static isEntity(entity: unknown): entity is DomainEntity<unknown> {
    return entity instanceof DomainEntity;
  }

  setId(id: string): void {
    this._id = DomainUuidValueObject.setId(id);
  }

  getId(): string {
    return this._id.unpack();
  }
}
