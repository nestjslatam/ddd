import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SingerRepository } from '../../../../infrastructure/db';
import { GetSingerByIdQuery } from './get-singer-byId.query';
import { SingerTable } from '../../../../../database/tables';
import { SingerMapper } from '../../../../infrastructure';

@QueryHandler(GetSingerByIdQuery)
export class GetSingerByIdQueryHandler implements IQueryHandler {
  constructor(private readonly singersRepository: SingerRepository) {}

  async execute(query: GetSingerByIdQuery): Promise<SingerTable> {
    const { id } = query;

    const singer = await this.singersRepository.findById(id);

    return SingerMapper.toTable(singer);
  }
}
