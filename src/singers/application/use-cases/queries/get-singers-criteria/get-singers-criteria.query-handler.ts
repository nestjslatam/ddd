import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SingerRepository } from '../../../../infrastructure/db';
import { GetSingersQuery } from './get-singers-criteria.query';

@QueryHandler(GetSingersQuery)
export class GetSingersQueryHandler implements IQueryHandler {
  constructor(private readonly singersRepository: SingerRepository) {}

  execute(query: GetSingersQuery): Promise<any> {
    return this.singersRepository.findAll(query);
  }
}
