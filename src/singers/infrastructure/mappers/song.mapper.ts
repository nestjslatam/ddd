import { Id } from 'src/shared/domain';
import { SingerTable, SongTable } from '../../../database/tables';
import { Song } from '../../domain';
import { TrackingProps } from '@nestjslatam/ddd-lib';

export class SongMapper {
  static toTable(domain: Song): SongTable {
    const { name, status, audit, singerId } = domain.getProps();

    const table = new SongTable();
    table.id = domain.getId();
    table.name = name.unpack();
    table.status = status;
    table.singer = new SingerTable();
    table.singer.id = singerId.unpack();

    const { createdBy, createdAt, updatedBy, updatedAt, timestamp } =
      audit.unpack();

    table.audit = {
      createdBy,
      createdAt,
      updatedBy,
      updatedAt,
      timestamp,
    };

    return table;
  }

  static toDomain(table: SongTable): Song {
    const { singerId, name, status, audit } = table;

    const domain = Song.load({
      id: table.id,
      name,
      singerId: singerId,
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
