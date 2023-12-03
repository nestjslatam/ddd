import { SingerTable } from '../../../database/tables';
import { Id } from '../../../shared';
import { Singer } from '../../domain';

export class SingerMapper {
  static toTable(domain: Singer): SingerTable {
    const {
      fullName,
      picture,
      registerDate,
      isSubscribed,
      subscribedDate,
      status,
      audit,
    } = domain.getProps();

    const table = new SingerTable();
    table.id = domain.getId();
    table.fullName = table.fullName = fullName.unpack();
    table.picture = picture.unpack();
    table.registerDate = registerDate.unpack();
    table.isSubscribed = isSubscribed;
    table.subscribedDate = subscribedDate.unpack();
    table.status = status;
    table.audit = audit.unpack();

    return table;
  }

  static toDomain(table: SingerTable): Singer {
    const {
      fullName,
      picture,
      registerDate,
      isSubscribed,
      subscribedDate,
      status,
      audit,
    } = table;

    const domain = Singer.load({
      id: table.id,
      fullName,
      picture,
      registerDate,
      isSubscribed,
      subscribedDate,
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
