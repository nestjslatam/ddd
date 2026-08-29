import { IsIn, IsString } from 'class-validator';

/**
 * The transport contract for PATCH /products/:id/status.
 *
 * `@IsIn` names the three values `ProductStatus` declares. That is a
 * deliberate duplication of a closed set, and the reason is which error the
 * caller gets: a bad status here is a 400 naming the accepted values, rather
 * than a 500 from deep inside the aggregate. The domain still owns whether a
 * given transition is legal -- ACTIVE to DELETED is a rule, not a type.
 */
export class ChangeProductStatusDto {
  @IsString()
  @IsIn(['ACTIVE', 'INACTIVE', 'DELETED'])
  status: string;
}
