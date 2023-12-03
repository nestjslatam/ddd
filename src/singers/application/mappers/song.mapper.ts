import { SongTable } from '../../../database/tables';
import { Id } from '../../../shared';
import { Song } from '../../domain';

export class SongMapper {
  static toTable(domain: Song): SongTable {
    const { singerId, name, status, audit } = domain.getProps();

    const table = new SongTable();
    table.id = domain.getId();
    table.singer.id = singerId.unpack();
    table.name = name.unpack();
    table.status = status;
    table.audit = audit.unpack();

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

    return domain;
  }
}
