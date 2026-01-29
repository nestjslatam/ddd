import { CreateOrderDto } from './create-order.dto';

export class CreateOrderCommand {
  public readonly customerName: string;
  public readonly customerEmail: string;
  public readonly customerPhone: string;
  public readonly shippingStreet: string;
  public readonly shippingComplement?: string;
  public readonly shippingCity: string;
  public readonly shippingState: string;
  public readonly shippingZipCode: string;
  public readonly shippingCountry: string;
  public readonly currency: string;

  constructor(dto: CreateOrderDto) {
    this.customerName = dto.customerName;
    this.customerEmail = dto.customerEmail;
    this.customerPhone = dto.customerPhone;
    this.shippingStreet = dto.shippingStreet;
    this.shippingComplement = dto.shippingComplement;
    this.shippingCity = dto.shippingCity;
    this.shippingState = dto.shippingState;
    this.shippingZipCode = dto.shippingZipCode;
    this.shippingCountry = dto.shippingCountry;
    this.currency = dto.currency || 'USD';
  }
}
