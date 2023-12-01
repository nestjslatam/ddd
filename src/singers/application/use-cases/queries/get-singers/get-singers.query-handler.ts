import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSingersQuery } from './get-singers.query';
import { SingerRepository } from '../../../../infrastructure/db';
import { SingerTable } from 'src/database/tables';

@QueryHandler(GetSingersQuery)
export class GetSingersQueryHandler implements IQueryHandler<GetSingersQuery> {
  constructor(private readonly singersRepository: SingerRepository) {}

  async execute(query: GetSingersQuery): Promise<SingerTable[]> {
    return this.singersRepository.find();
  }
}
