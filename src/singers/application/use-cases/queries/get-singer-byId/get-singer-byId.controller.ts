import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetSingerByIdQuery } from './get-singer-byId.query';

@Controller('singers')
export class GetSingerByIdCriteriaController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<any> {
    const query = new GetSingerByIdQuery(id);

    return await this.queryBus.execute(query);
  }
}
