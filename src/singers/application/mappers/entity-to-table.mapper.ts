import { Audit } from '../../../database/tables/audit.table';
import { SingerTable } from '../../../database/tables';
import { Singer, eSingerStatus } from '../../domain/singer';

export class SingerToSingerTableMapper {
  static map(singer: Singer): SingerTable {
    const { fullName, picture, registerDate, status } = singer.getPropsCopy();

    const dataTable = new SingerTable();
    dataTable.id = singer.getId();
    dataTable.fullName = fullName.unpack();
    dataTable.registerDate = registerDate.unpack();
    dataTable.picture = picture.unpack();
    dataTable.status = eSingerStatus[status];
    dataTable.audit = new Audit();

    const { createdAt, createdBy, updatedAt, updatedBy } = singer
      .getAudit()
      .unpack();

    dataTable.audit.createdAt = createdAt;
    dataTable.audit.createdBy = createdBy;
    dataTable.audit.updatedAt = updatedAt;
    dataTable.audit.updatedBy = updatedBy;
    dataTable.audit.timestamp = +new Date();

    return dataTable;
  }
}
