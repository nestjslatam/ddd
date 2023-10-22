import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class CreateSingerDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;
  @IsEmpty()
  @IsString()
  picture: string;
}
