import { BrokenRule } from '../core';
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

  protected businessRules(props: IDomainAuditProps): void {
    const { createdAt, createdBy, updatedBy, updatedAt } = props;

    if (!DomainGuard.isString(createdBy) || !DomainGuard.isEmpty(createdBy))
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'CreatedBy should be a string'),
      );

    if (!DomainGuard.isDate(createdAt))
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'CreatedAt should be a Date'),
      );

    if (updatedBy) {
      if (!DomainGuard.isString(updatedBy))
        this.addBrokenRule(
          new BrokenRule(this.constructor.name, 'UpdatedBy should be a string'),
        );

      if (!DomainGuard.isEmpty(updatedBy))
        this.addBrokenRule(
          new BrokenRule(
            this.constructor.name,
            'UpdatedBy should not be empty',
          ),
        );

      if (!DomainGuard.isDate(updatedAt))
        this.addBrokenRule(
          new BrokenRule(this.constructor.name, 'UpdatedAt should be a Date'),
        );
    }
  }

  load(plainProps: {
    createdBy: string;
    createdAt: Date;
    updatedBy: string;
    updatedAt: Date;
  }): DomainAuditValueObject {
    const { createdAt, createdBy, updatedBy, updatedAt } = plainProps;

    this.businessRules({ createdAt, createdBy, updatedBy, updatedAt });

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
}
