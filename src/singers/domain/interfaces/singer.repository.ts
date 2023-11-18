/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable prettier/prettier */
import { IDomainReadRepository, IDomainTransationRepository, IDomainWriteRepository } from './../../../../libs/ddd/src';
import { SingerTable } from '../../../database/tables';
import { Singer } from '../singer';


export interface ISingerReadRepository extends IDomainReadRepository<string, SingerTable>{}

export interface ISingerWriteRepository extends IDomainWriteRepository<string, SingerTable>{}

export interface ISingerTransactionRepository extends IDomainTransationRepository<Singer>{}
