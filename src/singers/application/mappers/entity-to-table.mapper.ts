import { SingerTable } from '../../../database/tables';
import { Singer, eSingerStatus } from '../../domain/singer';

export class SingerToSingerTableMapper {
  static map(singer: Singer): SingerTable {
    const {
      fullName,
      picture,
      registerDate,
      isSubscribed,
      subscribedDate,
      status,
    } = singer.getPropsCopy();

    const table = new SingerTable();

    table.id = singer.getId();
    table.fullName = fullName.unpack();
    table.picture = picture.unpack();
    table.registerDate = registerDate.unpack();
    table.isSubscribed = isSubscribed;
    table.subscribedDate = subscribedDate.unpack();
    table.audit = singer.getAudit().unpack();
    table.status = eSingerStatus[status];

    return table;
  }
}
