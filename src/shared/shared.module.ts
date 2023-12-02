import { Module } from '@nestjs/common';
import { MetaRequestContextService } from './application/context';

@Module({
  providers: [MetaRequestContextService],
})
export class SharedModule {}
