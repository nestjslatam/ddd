/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable prettier/prettier */
import {
  IDomainReadRepository,
  IDomainTransationRepository,
  IDomainWriteRepository,
} from '@nestjslatam/ddd-lib';
import { SingerTable, SongTable } from '../../../database/tables';
import { Singer } from '../singer';

export interface ISingerReadRepository
  extends IDomainReadRepository<string, SingerTable> {}

export interface ISingerWriteRepository
  extends IDomainWriteRepository<string, SingerTable> {
  addSong(singerId: string, song: SongTable): Promise<void>;
  removeSong(singerId: string, song: SongTable): Promise<void>;
}

export interface ISingerTransactionRepository
  extends IDomainTransationRepository<Singer> {}
