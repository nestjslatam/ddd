import { Module } from '@nestjs/common';

import { SingerService } from './application/singer.service';
import { SingerController } from './application/singer.controller';

@Module({
  controllers: [SingerController],
  providers: [SingerService],
})
export class SingersModule {}
