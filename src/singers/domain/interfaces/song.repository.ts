/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable prettier/prettier */
import {
  IDomainReadRepository,
  IDomainTransationRepository,
  IDomainWriteRepository,
} from '@nestjslatam/ddd-lib';
import { SongTable } from '../../../database/tables';
import { Song } from '../singers';

export interface ISongReadRepository
  extends IDomainReadRepository<string, SongTable> {
  exists(name: string, singerId: string): Promise<boolean>;
}

export interface ISongWriteRepository
  extends IDomainWriteRepository<string, SongTable> {}

export interface ISongTransactionRepository
  extends IDomainTransationRepository<Song> {}
