import { Body, Controller, Delete } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { RemoveSingerDto } from './remove-singer.dto';
import { RemoveSingerCommand } from './remove-singer.command';

@Controller('singers')
export class RemoveSingerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete()
  async remove(@Body() removeSingerDto: RemoveSingerDto): Promise<void> {
    if (!removeSingerDto || removeSingerDto === undefined) return;

    const { singerId, trackingId } = removeSingerDto;

    return await this.commandBus.execute(
      new RemoveSingerCommand(singerId, trackingId),
    );
  }
}
