import { IsNotEmpty, IsString } from 'class-validator';

export class SubscribeSingerDto {
  @IsNotEmpty()
  @IsString()
  singerId: string;
  @IsString()
  trackingId?: string;
}
