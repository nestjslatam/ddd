import { Body, Controller, Put } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SubscribeSingerDto } from './susbcribe-singer.dto';
import { SubscribeSingerCommand } from './susbcribe-singer.command';

@Controller('singers')
export class SubscribeSingerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put()
  async subscribe(
    @Body() subscribeSingerDto: SubscribeSingerDto,
  ): Promise<void> {
    if (!SubscribeSingerDto || SubscribeSingerDto === undefined) return;

    const { singerId, trackingId } = subscribeSingerDto;

    return await this.commandBus.execute(
      new SubscribeSingerCommand(singerId, trackingId),
    );
  }
}
