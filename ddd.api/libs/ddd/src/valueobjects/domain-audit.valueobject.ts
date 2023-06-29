import { DomainException } from '../exceptions';
import { DomainGuard } from '../helpers';
import { DomainValueObject } from './domain-valueobject';

export interface IDomainAuditProps {
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
}

export class DomainAuditValueObject extends DomainValueObject<IDomainAuditProps> {
  protected getCreatedBy() {
    return this.props.createdBy;
  }

  protected getCreatedAt() {
    return this.props.createdAt;
  }

  protected getUpdatedBy() {
    return this.props.updatedBy;
  }

  protected getUpdatedAt() {
    return this.props.updatedAt;
  }

  constructor(props: IDomainAuditProps) {
    super(props);
  }

  static create(createdBy: string, createdAt: Date = new Date()) {
    return new DomainAuditValueObject({
      createdBy,
      createdAt,
    });
  }

  load(plainProps: {
    createdBy: string;
    createdAt: Date;
    updatedBy: string;
    updatedAt: Date;
  }): DomainAuditValueObject {
    const { createdAt, createdBy, updatedBy, updatedAt } = plainProps;

    this.validate({ createdAt, createdBy, updatedBy, updatedAt });

    const audit = DomainAuditValueObject.create(plainProps.createdBy);
    audit.props.createdAt = plainProps.createdAt;
    audit.props.updatedBy = plainProps.updatedBy;
    audit.props.updatedAt = plainProps.updatedAt;
    return audit;
  }

  update(updatedBy: string, updatedAt: Date = new Date()) {
    this.props.updatedBy = updatedBy;
    this.props.updatedAt = updatedAt;
  }

  protected validate(props: IDomainAuditProps): void {
    const { createdAt, createdBy, updatedBy, updatedAt } = props;

    this.guard(createdBy, createdAt, updatedBy, updatedAt);
  }

  private guard = (createdBy, createdAt, updatedBy, updatedAt) => {
    if (!DomainGuard.isString(createdBy) || !DomainGuard.isEmpty(createdBy))
      throw new DomainException('CreatedBy should be a string');

    if (!DomainGuard.isDate(createdAt))
      throw new DomainException('CreatedAt should be a Date');

    if (updatedBy) {
      if (!DomainGuard.isString(updatedBy))
        throw new DomainException('UpdatedBy should be a string');

      if (!DomainGuard.isEmpty(updatedBy))
        throw new DomainException('UpdatedBy should not be empty');
    }

    if (updatedAt) {
      if (!DomainGuard.isDate(updatedAt))
        throw new DomainException('UpdatedAt should be a Date');
    }
  };
}
