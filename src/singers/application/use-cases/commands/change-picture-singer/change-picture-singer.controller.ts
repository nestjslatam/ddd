import { Body, Controller, Param, Put } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ChangePictureSingerDto } from './change-picture-singer.dto';
import { ChangePictureSingerCommand } from './change-picture-singer.command';

@Controller('singers')
export class ChangePictureSingerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put('/changepicture/:id')
  async changePicture(
    @Param() id: string,
    @Body() changePictureSingerDto: ChangePictureSingerDto,
  ): Promise<void> {
    if (!changePictureSingerDto || changePictureSingerDto === undefined) return;

    const { newPicture, trackingId } = changePictureSingerDto;

    return await this.commandBus.execute(
      new ChangePictureSingerCommand(id, newPicture, trackingId),
    );
  }
}
