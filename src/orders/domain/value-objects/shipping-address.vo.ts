import { DddValueObject } from '@nestjslatam/ddd-lib';

export interface IShippingAddressProps {
  street: string;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export class ShippingAddress extends DddValueObject<IShippingAddressProps> {
  private constructor(props: IShippingAddressProps) {
    super(props);
    this.validateProps(props);
  }

  public static create(
    street: string,
    complement: string | undefined,
    city: string,
    state: string,
    zipCode: string,
    country: string,
  ): ShippingAddress {
    return new ShippingAddress({
      street,
      complement,
      city,
      state,
      zipCode,
      country,
    });
  }

  public get street(): string {
    return this.getValue().street;
  }

  public get complement(): string | undefined {
    return this.getValue().complement;
  }

  public get city(): string {
    return this.getValue().city;
  }

  public get state(): string {
    return this.getValue().state;
  }

  public get zipCode(): string {
    return this.getValue().zipCode;
  }

  public get country(): string {
    return this.getValue().country;
  }

  public getFullAddress(): string {
    const parts = [
      this.street,
      this.complement,
      this.city,
      this.state,
      this.zipCode,
      this.country,
    ].filter((part) => part && part.trim().length > 0);
    return parts.join(', ');
  }

  private validateProps(props: IShippingAddressProps): void {
    if (!props.street || props.street.trim().length === 0) {
      throw new Error('Street is required');
    }
    if (!props.city || props.city.trim().length === 0) {
      throw new Error('City is required');
    }
    if (!props.state || props.state.trim().length === 0) {
      throw new Error('State is required');
    }
    if (!props.zipCode || props.zipCode.trim().length === 0) {
      throw new Error('Zip code is required');
    }
    if (!props.country || props.country.trim().length === 0) {
      throw new Error('Country is required');
    }
  }

  protected getEqualityComponents(): Iterable<any> {
    return [
      this.street,
      this.complement,
      this.city,
      this.state,
      this.zipCode,
      this.country,
    ];
  }

  addValidators(): void {
    // Validation done in constructor
  }
}
