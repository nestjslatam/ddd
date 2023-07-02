import { Module } from '@nestjs/common';

import { DomainGuard } from './helpers';

@Module({
  exports: [DomainGuard],
})
export class DddModule {}
