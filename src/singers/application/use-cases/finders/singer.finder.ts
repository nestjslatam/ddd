import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { Singer } from '../../../domain';
import { SingerRepository } from '../../../infrastructure/db';
import { SingerTable } from '../../../../database/tables';
import { ApplicationException } from '../../../../shared';

@Injectable()
export class SingerFinder {
  constructor(
    private readonly singerRepository: SingerRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async find(FullName: string): Promise<Singer> {
    const tableFound = await this.singerRepository.findByName(FullName);

    if (!tableFound)
      throw new ApplicationException(`Singer with name ${FullName} not found`);

    return await this.mapper.mapAsync(tableFound, SingerTable, Singer);
  }
}
