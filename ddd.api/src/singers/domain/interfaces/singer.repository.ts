/* eslint-disable @typescript-eslint/no-empty-interface */
import { IRepository } from '../../../shared/domain';

import { SingerTable } from '../../../database/tables';
import { Singer } from '../singer';

export interface ISingerRepository extends IRepository<Singer, SingerTable> {
  findAll(): Promise<SingerTable[]>;
}
