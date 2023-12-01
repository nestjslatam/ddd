import { Body, Controller, Put } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ChangeFullNameSingerDto } from './change-fullname-singer.dto';
import { ChangeFullNameSingerCommand } from './change-fullname-singer.command';

@Controller('singers')
export class ChangeFullNameSingerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put()
  async changeFullName(
    @Body() changeFullNameSingerDto: ChangeFullNameSingerDto,
  ): Promise<void> {
    if (!changeFullNameSingerDto || changeFullNameSingerDto === undefined)
      return;

    const { newFullName, singerId, trackingId } = changeFullNameSingerDto;

    return await this.commandBus.execute(
      new ChangeFullNameSingerCommand(singerId, newFullName, trackingId),
    );
  }
}
