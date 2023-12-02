import { IsOptional } from 'class-validator';

export class GetSingersDto {
  @IsOptional()
  readonly name?: string;
}
