import { Id } from 'src/shared/domain';
import { SongTable } from '../../../database/tables';
import { Song } from '../../domain';
import { TrackingProps } from '@nestjslatam/ddd-lib';

export class SongMapper {
  static toTable(domain: Song): SongTable {
    const { singerId, name, status, audit } = domain.getProps();

    const table = new SongTable();
    table.id = domain.getId();
    table.singer.id = singerId.unpack();
    table.name = name.unpack();
    table.status = status;
    const { createdBy, createdAt, updatedBy, updatedAt, timestamp } =
      audit.unpack();

    table.audit.createdBy = createdBy;
    table.audit.createdAt = createdAt;
    table.audit.updatedBy = updatedBy;
    table.audit.updatedAt = updatedAt;
    table.audit.timestamp = timestamp;

    return table;
  }

  static toDomain(table: SongTable): Song {
    const { singer, name, status, audit } = table;

    const domain = Song.load({
      id: table.id,
      name,
      singerId: singer.id,
      status,
      audit: {
        createdBy: audit.createdBy,
        createdDate: audit.createdAt,
        updatedDate: audit.updatedAt,
        updatedBy: audit.updatedBy,
        timestamp: audit.timestamp,
      },
    });

    domain.setId(Id.load(table.id));

    domain.setTrackingProps(TrackingProps.setDirty());

    return domain;
  }
}
