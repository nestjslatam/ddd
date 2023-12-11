import { Body, Controller, Param, Put } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ChangeFullNameSingerDto } from './change-fullname-singer.dto';
import { ChangeFullNameSingerCommand } from './change-fullname-singer.command';

@Controller('singers')
export class ChangeFullNameSingerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put('/changename/:id')
  async changeFullName(
    @Param('id') id: string,
    @Body() changeFullNameSingerDto: ChangeFullNameSingerDto,
  ): Promise<void> {
    if (!changeFullNameSingerDto || changeFullNameSingerDto === undefined)
      return;

    const { newFullName, trackingId } = changeFullNameSingerDto;

    return await this.commandBus.execute(
      new ChangeFullNameSingerCommand(id, newFullName, trackingId),
    );
  }
}
