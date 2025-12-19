import { SingerTable, SongTable } from '../db/tables';
import { ISongRaw, Song } from '../../domain';

export class SongMapper {
  static toTable(domain: Song): SongTable {
    const { name, status, audit, singerId } = domain.props;

    const table = new SongTable();
    table.id = domain.id;
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

    const songRaw: ISongRaw = {
      id: table.id,
      name: name,
      singerId: singerId,
      status,
      audit: {
        createdBy: audit.createdBy,
        createdAt: audit.createdAt,
        updatedAt: audit.updatedAt,
        updatedBy: audit.updatedBy,
        timestamp: audit.timestamp,
      },
    };

    const domain = Song.fromRaw(songRaw);

    domain.markAsDirty();

    return domain;
  }
}
