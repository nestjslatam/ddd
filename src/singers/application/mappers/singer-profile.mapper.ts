import {
  Mapper,
  MappingProfile,
  createMap,
  forMember,
  mapFrom,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';

import { PicturePath, FullName, Singer } from '../../domain';
import { SingerTable, AuditTable } from '../../../database/tables';
import { RegisterDate } from '../../../shared';
import { DomainAuditValueObject } from '@nestjslatam/ddd-lib';

export interface IAuditConverter<TSource, TResult> {
  convert(source: TSource): TResult;
}

export const AuditConverter: IAuditConverter<
  AuditTable,
  DomainAuditValueObject
> = {
  convert(source: AuditTable): DomainAuditValueObject {
    const { createdAt, createdBy, updatedBy, updatedAt, timestamp } = source;

    return DomainAuditValueObject.load({
      createdBy,
      createdAt,
      updatedBy,
      updatedAt,
      timestamp,
    });
  },
};

@Injectable()
export class SingerMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<Singer, SingerTable>(
        mapper,
        Singer,
        SingerTable,
        forMember(
          (d) => d.id,
          mapFrom((s) => s.getId()),
        ),
        forMember(
          (d) => d.fullName,
          mapFrom((s) => s.getPropsCopy().fullName.unpack()),
        ),
        forMember(
          (d) => d.picture,
          mapFrom((s) => s.getPropsCopy().picture.unpack()),
        ),
        forMember(
          (d) => d.registerDate,
          mapFrom((s) => s.getPropsCopy().registerDate.unpack()),
        ),
        forMember(
          (d) => d.isSubscribed,
          mapFrom((s) => s.getPropsCopy().isSubscribed),
        ),
        forMember(
          (d) => d.status,
          mapFrom((s) => s.getPropsCopy().status),
        ),
        forMember(
          (d) => d.audit.createdAt,
          mapFrom((s) => s.getProps().audit.unpack().createdAt),
        ),
        forMember(
          (d) => d.audit.createdBy,
          mapFrom((s) => s.getProps().audit.unpack().createdBy),
        ),
        forMember(
          (d) => d.audit.updatedAt,
          mapFrom((s) => s.getProps().audit.unpack().updatedAt),
        ),
        forMember(
          (d) => d.audit.updatedBy,
          mapFrom((s) => s.getProps().audit.unpack().updatedBy),
        ),
        forMember(
          (d) => d.audit.timestamp,
          mapFrom((s) => s.getProps().audit.unpack().timestamp),
        ),
      );

      createMap<SingerTable, Singer>(
        mapper,
        SingerTable,
        Singer,
        forMember(
          (d) => d.getProps().fullName,
          mapFrom((s) => FullName.create(s.id)),
        ),
        forMember(
          (d) => d.getProps().picture,
          mapFrom((s) => PicturePath.create(s.picture)),
        ),
        forMember(
          (d) => d.getProps().registerDate,
          mapFrom((s) => RegisterDate.create(s.registerDate)),
        ),
        forMember(
          (d) => d.getProps().status,
          mapFrom((s) => s.status),
        ),
        forMember(
          (d) => d.getProps().audit.unpack(),
          mapFrom((s) => s.audit),
        ),
      );
    };
  }
}
