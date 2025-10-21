/* eslint-disable @typescript-eslint/no-unused-vars */
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SingerMapper } from './../../../../infrastructure/mappers/singer.mapper';
import { SingerRepository, SingerTable } from '../../../../infrastructure/db';
import { GetSingersQuery } from './get-singers-criteria.query';

@QueryHandler(GetSingersQuery)
export class GetSingersQueryHandler implements IQueryHandler {
  constructor(private readonly singersRepository: SingerRepository) {}

  async execute(query: GetSingersQuery): Promise<SingerTable[]> {
    const result = await this.singersRepository.find();
    return result.map((singer) => SingerMapper.toTable(singer));
  }
}
