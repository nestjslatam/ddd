import { BrokenRule } from '../ddd-core';
import { AbstractDomainValueObject } from '../ddd-core/ddd-base-classes';

/**
 * Represents the properties of a domain audit.
 */
export interface IDomainAuditProps {
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
  timestamp?: number;
}

/**
 * Represents a domain audit value object.
 */
export class DomainAudit extends AbstractDomainValueObject<IDomainAuditProps> {
  /**
   * Creates a new instance of the DomainAudit class.
   * @param props - The properties of the domain audit.
   */
  constructor(props: IDomainAuditProps) {
    super(props);
    this.businessRules(props);

    this._props.timestamp = +new Date();
  }

  /**
   * Gets the value of the createdBy property.
   * @returns The createdBy value.
   */
  get CreatedBy() {
    return this._props.createdBy;
  }

  /**
   * Gets the value of the createdAt property.
   * @returns The createdAt value.
   */
  get CreatedAt() {
    return this._props.createdAt;
  }

  /**
   * Gets the value of the updatedBy property.
   * @returns The updatedBy value.
   */
  get UpdatedBy() {
    return this._props.updatedBy;
  }

  /**
   * Gets the value of the updatedAt property.
   * @returns The updatedAt value.
   */
  get UpdatedAt() {
    return this._props.updatedAt;
  }

  /**
   * Gets the value of the timestamp property.
   * @returns The timestamp value.
   */
  get TimeStamp() {
    return this._props.timestamp;
  }

  /**
   * Creates a new instance of the DomainAudit class.
   * @param props - The properties of the domain audit.
   * @returns A new instance of the DomainAudit class.
   */
  static create(props: IDomainAuditProps): DomainAudit {
    return new DomainAudit(props);
  }

  /**
   * Applies the business rules to the domain audit properties.
   * @param props - The properties of the domain audit.
   */
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

  /**
   * Updates the domain audit properties.
   * @param updatedBy - The updatedBy value.
   * @param updatedAt - The updatedAt value. Default is the current date.
   * @param timestamp - The timestamp value. Default is the current timestamp.
   * @returns The updated instance of the DomainAudit class.
   */
  update(updatedBy: string, updatedAt: Date): this {
    this._props.updatedBy = updatedBy;
    this._props.updatedAt = updatedAt;
    this._props.timestamp = +new Date();

    return this;
  }

  /**
   * Gets the raw properties of the domain audit.
   @returns The raw properties of the domain audit.
   */
  getRaw(): IDomainAuditProps {
    return this._props;
  }

  /**
   * Creates a new instance of the DomainAudit class from raw properties.
   @param raw - The raw properties of the domain audit.
   @returns A new instance of the DomainAudit class.
   */
  static getFromRaw(raw: IDomainAuditProps): DomainAudit {
    return new DomainAudit(raw);
  }
}
