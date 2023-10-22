import { Injectable } from '@nestjs/common';

import { SingerRepository } from '../infrastructure/db';
import { Singer, eSingerStatus } from '../domain/singer';
import { SingerTable } from '../../database/tables';
import { CreateSingerDto } from './dto/create-singer.dto';
import { Id, RegisterDate } from '../../shared/domain';
import { FullName } from '../domain/fullname';
import { PicturePath } from '../domain/picture-path';

@Injectable()
export class SingerService {
  constructor(private readonly repository: SingerRepository) {}

  async findAll(): Promise<Singer[]> {
    const singerTable = await this.repository.findAll();

    return this.mapFromTable(singerTable);
  }

  async findOneById(id: string): Promise<Singer> {
    const singerTables: SingerTable[] = [];

    singerTables.push(await this.repository.findOneById(id));

    return await this.mapFromTable(singerTables)[0];
  }

  async create(createSingerDto: CreateSingerDto) {
    const { fullName, picture } = createSingerDto;

    const singer = Singer.create({
      id: Id.create(),
      fullName: FullName.create(fullName),
      picture: PicturePath.create(picture),
      registerDate: RegisterDate.create(new Date()),
      isSubscribed: false,
      status: eSingerStatus.REGISTERED,
      subscribedDate: null,
    });

    return await this.repository.create(singer);
  }

  async changeFullName(singerId: string, newFName: string): Promise<void> {
    const singer = await this.findOneById(singerId);

    singer.getPropsCopy().fullName = FullName.create(newFName);

    await this.repository.update(singerId, singer);
  }

  async uploadPicture(singerId: string, newPicturePath: string): Promise<void> {
    const singer = await this.findOneById(singerId);

    singer.getPropsCopy().picture = PicturePath.create(newPicturePath);

    await this.repository.update(singerId, singer);
  }

  async subscribe(singerId: string): Promise<void> {
    const singer = await this.findOneById(singerId);

    singer.subscribe();

    await this.repository.update(singerId, singer);
  }

  async delete(singerId: string): Promise<void> {
    const singer = await this.findOneById(singerId);

    if (!singer) throw new Error('Singer cannot be deleted');

    await this.repository.delete(singerId);
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
