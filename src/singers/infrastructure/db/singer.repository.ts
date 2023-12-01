import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

import { AbstractRepository } from '../../../shared';
import { SingerTable } from '../../../database/tables';

@Injectable()
export class SingerRepository extends AbstractRepository<SingerTable> {
  constructor(
    @InjectRepository(SingerTable)
    readonly repository: Repository<SingerTable>,
    @InjectMapper() readonly mapper: Mapper,
  ) {
    super(repository);
  }
}
