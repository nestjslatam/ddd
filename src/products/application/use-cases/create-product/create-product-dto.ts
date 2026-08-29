import { IsNumber, IsString } from 'class-validator';

/**
 * The transport contract for POST /products.
 *
 * These decorators are not decoration. `main.ts` installs a global
 * `ValidationPipe({ whitelist: true })`, and `whitelist` keeps only the
 * properties that carry a validation decorator -- so a DTO with none is
 * stripped to `{}` and the handler receives nothing. Every write endpoint in
 * this sample failed that way until these were added.
 *
 * What belongs here is structure: the field is present and is of the right
 * type. What does NOT belong here is the domain's invariants -- `Name`
 * requires 3 to 100 characters and `Price` requires a positive value, and
 * those live in their validators where the aggregate can enforce them no
 * matter which transport the data arrived on.
 */
export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;
}
