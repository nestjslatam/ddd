import { IsNotEmpty, IsString } from 'class-validator';

export class SubscribeSingerDto {
  @IsNotEmpty()
  singerId: string;
  @IsString()
  trackingId?: string;
}
