import { IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * The transport contract for POST /orders.
 *
 * Without these decorators the global `ValidationPipe({ whitelist: true })`
 * strips every property and the handler receives `{}` -- which is how this
 * endpoint returned 500 on every call.
 *
 * `@IsEmail` is the one rule here that is more than structural, and it earns
 * its place: an address that is not an address is a transport-level mistake
 * the caller should hear about as a 400, not a domain invariant.
 */
export class CreateOrderDto {
  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  customerPhone: string;

  @IsString()
  shippingStreet: string;

  @IsOptional()
  @IsString()
  shippingComplement?: string;

  @IsString()
  shippingCity: string;

  @IsString()
  shippingState: string;

  @IsString()
  shippingZipCode: string;

  @IsString()
  shippingCountry: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
