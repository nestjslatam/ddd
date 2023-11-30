import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CreateSingerDto } from './create-singer.dto';
import { CreateSingerCommand } from './create-singer-command';

@Controller('singers')
export class CreateSingerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async Create(@Body() createSingerDto: CreateSingerDto): Promise<void> {
    if (!createSingerDto || createSingerDto === undefined) return;

    const { fullName, picture, trackingId } = createSingerDto;

    return await this.commandBus.execute(
      new CreateSingerCommand(fullName, picture, trackingId),
    );
  }
}
