import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SongTable } from '../../../database/tables';
import { AbstractRepository } from '../../../shared';
import { Repository } from 'typeorm';

@Injectable()
export class SongRepository extends AbstractRepository<SongTable> {
  constructor(
    @InjectRepository(SongTable) readonly repository: Repository<SongTable>,
  ) {
    super(repository);
  }
}
