import { Module } from '@nestjs/common';
import { DddModule } from '@nestjslatam/ddd';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [DddModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
