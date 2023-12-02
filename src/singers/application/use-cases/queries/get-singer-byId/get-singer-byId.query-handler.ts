import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SingerRepository } from '../../../../infrastructure/db';
import { GetSingerByIdQuery } from './get-singer-byId.query';
import { SingerTable } from '../../../../../database/tables';

@QueryHandler(GetSingerByIdQuery)
export class GetSingerByIdQueryHandler implements IQueryHandler {
  constructor(private readonly singersRepository: SingerRepository) {}

  async execute(query: GetSingerByIdQuery): Promise<SingerTable> {
    return await this.singersRepository.findById(query.id);
  }
}
