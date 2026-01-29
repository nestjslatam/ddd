import { DddValueObject } from '@nestjslatam/ddd-lib';

export interface ICustomerInfoProps {
  name: string;
  email: string;
  phone: string;
}

export class CustomerInfo extends DddValueObject<ICustomerInfoProps> {
  private constructor(props: ICustomerInfoProps) {
    super(props);
    this.validateProps(props);
  }

  public static create(
    name: string,
    email: string,
    phone: string,
  ): CustomerInfo {
    return new CustomerInfo({ name, email, phone });
  }

  public get name(): string {
    return this.getValue().name;
  }

  public get email(): string {
    return this.getValue().email;
  }

  public get phone(): string {
    return this.getValue().phone;
  }

  private validateProps(props: ICustomerInfoProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Customer name is required');
    }
    if (!props.email || props.email.trim().length === 0) {
      throw new Error('Customer email is required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email)) {
      throw new Error('Customer email is invalid');
    }
    if (!props.phone || props.phone.trim().length === 0) {
      throw new Error('Customer phone is required');
    }
  }

  protected getEqualityComponents(): Iterable<any> {
    return [this.name, this.email, this.phone];
  }

  addValidators(): void {
    // Validation done in constructor
  }
}
