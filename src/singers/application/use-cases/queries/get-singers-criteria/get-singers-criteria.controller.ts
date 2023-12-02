import { Body, Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { GetSingersQuery } from './get-singers-criteria.query';
import { GetSingersDto } from './get-singers.dto';
import { PaginatedQueryRequestDto } from './get-paginated-query.dto';

@Controller('singers')
export class GetSingersByCriteriaController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async getAllByCriteria(
    @Body() requestDto: GetSingersDto,
    @Query() queryParams: PaginatedQueryRequestDto,
  ): Promise<void> {
    const query = new GetSingersQuery({
      ...requestDto,
      limit: queryParams?.limit,
      page: queryParams?.page,
    });

    return await this.queryBus.execute(query);
  }
}
