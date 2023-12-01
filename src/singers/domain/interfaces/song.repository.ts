/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable prettier/prettier */
import {
  IDomainReadRepository,
  IDomainTransationRepository,
  IDomainWriteRepository,
} from '@nestjslatam/ddd-lib';
import { SongTable } from '../../../database/tables';
import { Song } from '../song';

export interface ISongReadRepository
  extends IDomainReadRepository<string, SongTable> {}

export interface ISongWriteRepository
  extends IDomainWriteRepository<string, SongTable> {}

export interface ISongTransactionRepository
  extends IDomainTransationRepository<Song> {}
