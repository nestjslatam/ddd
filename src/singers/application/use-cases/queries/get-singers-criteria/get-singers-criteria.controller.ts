/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetSingersQuery } from './get-singers-criteria.query';
import { GetSingersDto } from './get-singers.dto';

@Controller('singers')
export class GetSingersByCriteriaController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async getAllByCriteria(@Body() requestDto: GetSingersDto): Promise<void> {
    const query = new GetSingersQuery();
    return await this.queryBus.execute(query);
  }
}
