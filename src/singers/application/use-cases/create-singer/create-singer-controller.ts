import { Body, Controller, Post } from '@nestjs/common';
import { DomainCommandBus } from '@nestjslatam/ddd-lib';

import { CreateSingerDto } from './create-singer.dto';
import { CreateSingerCommad } from './create-singer-command';

@Controller('singers')
export class CreateSingerController {
  constructor(private readonly commandBus: DomainCommandBus) {}

  @Post()
  async Create(@Body() createSingerDto: CreateSingerDto): Promise<void> {
    if (!createSingerDto || createSingerDto === undefined) return;

    const { fullName, picture, trackingId } = createSingerDto;

    return await this.commandBus.execute(
      new CreateSingerCommad(fullName, picture, trackingId),
    );
  }
}
