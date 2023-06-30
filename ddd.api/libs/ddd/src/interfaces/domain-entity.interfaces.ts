import { DomainAuditValueObject, DomainIdValueObject } from '../valueobjects';

export interface IDomainTrackingStatusProps {
  isDirty: boolean;
  isNew: boolean;
  isDeleted: boolean;
}

export interface IDomainEntityProps<T> {
  id: DomainIdValueObject;
  props: T;
  audit: DomainAuditValueObject;
}
