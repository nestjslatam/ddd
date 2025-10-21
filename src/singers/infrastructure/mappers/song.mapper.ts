import { Id } from 'src/shared/domain';
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

    const songRaw = {
      id: table.id,
      songName: name,
      singerId: singerId,
      status,
      audit: {
        createdBy: audit.createdBy,
        createdAt: audit.createdAt,
        updatedAt: audit.updatedAt,
        updatedBy: audit.updatedBy,
        timestamp: audit.timestamp,
      },
    } as ISongRaw;

    const domain = Song.fromRaw(songRaw);

    domain.id = Id.load(table.id);

    domain.markAsDirty();

    return domain;
  }
}
