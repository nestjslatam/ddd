import { Module } from '@nestjs/common';
import { Description, Name, Price } from './valueobjects';

@Module({
  imports: [],
  providers: [],
  exports: [Name, Description, Price],
})
export class SharedModule {}
