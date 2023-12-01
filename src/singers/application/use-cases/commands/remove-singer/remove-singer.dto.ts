import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveSingerDto {
  @IsNotEmpty()
  @IsString()
  singerId: string;
  @IsString()
  trackingId?: string;
}
