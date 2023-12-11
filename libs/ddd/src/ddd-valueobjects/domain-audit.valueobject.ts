import { BrokenRule } from '../ddd-core';
import { AbstractDomainValueObject } from '../ddd-valueobject';

export interface IDomainAuditProps {
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
  timestamp?: number;
}

export class DomainAudit extends AbstractDomainValueObject<IDomainAuditProps> {
  constructor(props: IDomainAuditProps) {
    super(props);
    this.businessRules(props);

    this.props.timestamp = +new Date();
  }

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
  protected getTimeStamp() {
    return this.props.timestamp;
  }

  static create(props: IDomainAuditProps): DomainAudit {
    return new DomainAudit(props);
  }

  protected businessRules(props: IDomainAuditProps): void {
    const { createdAt, createdBy, updatedBy, updatedAt } = props;

    if (
      typeof createdBy !== 'string' ||
      createdBy === null ||
      createdBy === '' ||
      createdBy === undefined
    )
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'CreatedBy should be a string'),
      );

    if (!(createdAt instanceof Date) || createdAt === null)
      this.addBrokenRule(
        new BrokenRule(this.constructor.name, 'CreatedAt should be a Date'),
      );

    if (updatedAt !== null && updatedBy !== null) {
      if (
        typeof updatedBy !== 'string' ||
        updatedBy === null ||
        updatedBy === '' ||
        updatedBy === undefined
      )
        this.addBrokenRule(
          new BrokenRule(this.constructor.name, 'UpdatedBy should be a string'),
        );

      if (!(updatedAt instanceof Date) || updatedAt === null)
        this.addBrokenRule(
          new BrokenRule(this.constructor.name, 'UpdateAt should be a Date'),
        );
    }
  }

  update(
    updatedBy: string,
    updatedAt: Date = new Date(),
    timestamp: number = +new Date(),
  ): this {
    this.props.updatedBy = updatedBy;
    this.props.updatedAt = updatedAt;
    this.props.timestamp = timestamp;

    return this;
  }
}
