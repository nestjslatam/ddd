import { Injectable } from '@nestjs/common';

import { Singer } from '../../../domain';
import { SingerRepository } from '../../../infrastructure/db';
import { ApplicationException } from '../../../../shared';
import { SingerMapper } from '../../mappers';

@Injectable()
export class SingerFinder {
  constructor(private readonly singerRepository: SingerRepository) {}

  async find(FullName: string): Promise<Singer> {
    const tableFound = await this.singerRepository.findByName(FullName);

    if (!tableFound)
      throw new ApplicationException(`Singer with name ${FullName} not found`);

    return SingerMapper.toDomain(tableFound);
  }
}
