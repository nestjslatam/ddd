import { DddValueObject } from '@nestjslatam/ddd-lib';
import {
  ArgumentNullException,
  InvalidFormatException,
} from '@nestjslatam/ddd-lib';

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
      throw new ArgumentNullException('customerName');
    }
    if (!props.email || props.email.trim().length === 0) {
      throw new ArgumentNullException('customerEmail');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email)) {
      throw new InvalidFormatException(
        'customerEmail',
        'a valid email address',
      );
    }
    if (!props.phone || props.phone.trim().length === 0) {
      throw new ArgumentNullException('customerPhone');
    }
  }

  protected getEqualityComponents(): Iterable<any> {
    return [this.name, this.email, this.phone];
  }

  addValidators(): void {
    // Validation done in constructor
  }
}
