import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SongTable } from '../../../database/tables';
import {
  AbstractRepository,
  DatabaseException,
  Paginated,
  PaginatedQueryParams,
} from '../../../shared';
import { Repository } from 'typeorm';

@Injectable()
export class SongRepository extends AbstractRepository<string, SongTable> {
  protected tableName: string = 'songs';

  constructor(
    @InjectRepository(SongTable) readonly repository: Repository<SongTable>,
  ) {
    super(repository);
  }

  async findAll(params: PaginatedQueryParams): Promise<Paginated<SongTable>> {
    try {
      const result = await this.repository
        .createQueryBuilder(this.tableName)
        .select()
        .skip(params.limit)
        .take(params.offset)
        .getMany();

      const resultPag = new Paginated({
        data: result,
        count: result.length,
        limit: params.limit,
        page: params.page,
      });

      return resultPag;
    } catch (error) {
      throw new DatabaseException(error);
    }
  }

  async exists(name: string, singerId: string): Promise<boolean> {
    try {
      const result = await this.repository.findOne({
        where: {
          name,
          singer: { id: singerId },
        },
      });

      return !!result;
    } catch (error) {
      throw new DatabaseException(error);
    }
  }
}
