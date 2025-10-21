import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SingerRepository, SingerTable } from '../../../../infrastructure/db';
import { GetSingerByIdQuery } from './get-singer-byId.query';

import { SingerMapper } from '../../../../infrastructure';

@QueryHandler(GetSingerByIdQuery)
export class GetSingerByIdQueryHandler implements IQueryHandler {
  constructor(private readonly singersRepository: SingerRepository) {}

  async execute(query: GetSingerByIdQuery): Promise<SingerTable> {
    const { id } = query;

    const singer = await this.singersRepository.findById(id);

    if (!singer) {
      throw new Error('Singer not found');
    }

    return SingerMapper.toTable(singer);
  }
}
