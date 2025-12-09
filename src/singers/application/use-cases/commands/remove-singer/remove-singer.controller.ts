import { Controller, Delete, Param } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { RemoveSingerCommand } from './remove-singer.command';

@Controller('singers')
export class RemoveSingerController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new RemoveSingerCommand(id));
  }
}