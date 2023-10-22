import { Injectable } from '@nestjs/common';
import { SingerRepository } from '../infrastructure/db';
import { Singer } from '../domain/singer';
import { SingerTable } from 'src/database/tables';

@Injectable()
export class SingerService {
  constructor(private readonly repository: SingerRepository) {}

  async findAll(): Promise<Singer[]> {
    const singerTable = await this.repository.findAll();

    return this.mapFromTable(singerTable);
  }

  private async mapFromTable(singerTables: SingerTable[]): Promise<Singer[]> {
    const singerEntities: Singer[] = [];

    singerTables.map((sigerEntities) => {
      const {
        id,
        fullName,
        picture,
        registerDate,
        isSubscribed,
        subscribedDate,
        status,
      } = sigerEntities;

      singerEntities.push(
        Singer.load({
          id,
          fullName,
          picture,
          registerDate,
          isSubscribed,
          subscribedDate,
          status,
        }),
      );
    });

    return singerEntities;
  }
}
