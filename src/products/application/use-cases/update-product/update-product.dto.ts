import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * The transport contract for PUT /products/:id. Every field is optional: an
 * update carries only what changed.
 *
 * `@IsOptional()` is required alongside the type decorator. Without it the
 * field is mandatory; without the type decorator, `whitelist` strips it.
 */
export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;
}
