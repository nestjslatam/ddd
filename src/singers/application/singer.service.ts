import { Injectable } from '@nestjs/common';

import { SingerRepository } from '../infrastructure/db';
import { Singer, eSingerStatus } from '../domain/singer';
import { SingerTable } from '../../database/tables';
import { CreateSingerDto } from './dto/create-singer.dto';
import { Id, RegisterDate } from '../../shared/domain';
import { FullName } from '../domain/fullname';
import { PicturePath } from '../domain/picture-path';
import { SingerInfoDto } from './dto';
import { UploadPictureDto } from './dto/upload-picture';
import { SubscribeSingerDto } from './dto/subscribe-singer.dto';

@Injectable()
export class SingerService {
  constructor(private readonly repository: SingerRepository) {}

  async findAll(): Promise<SingerInfoDto[]> {
    const singerTable = await this.repository.findAll();

    return this.mapInfoFromTable(singerTable);
  }

  async findOneById(id: string): Promise<SingerInfoDto> {
    const songTable = await this.repository.findOneById(id);

    const singers = await this.mapInfoFromTable([songTable]);

    return singers[0];
  }

  async create(createSingerDto: CreateSingerDto): Promise<void> {
    const { fullName, picture } = createSingerDto;

    const singer = Singer.create({
      fullName: FullName.create(fullName),
      picture: PicturePath.create(picture),
      registerDate: RegisterDate.create(new Date()),
      isSubscribed: false,
      status: eSingerStatus.REGISTERED,
    });

    return await this.repository.create(singer);
  }

  async changeFullName(singerId: string, newFullName: string): Promise<void> {
    const singerEntity = await this.mapEntityFromTable(singerId);

    const newFullNameParsed = FullName.create(newFullName);

    singerEntity.changeName(newFullNameParsed);

    await this.repository.update(singerId, singerEntity as Singer);
  }

  async uploadPicture(
    singerId: string,
    uploadPicture: UploadPictureDto,
  ): Promise<void> {
    const singerEntity = await this.mapEntityFromTable(singerId);

    singerEntity.uploadPicture(PicturePath.create(uploadPicture.newUrlPath));

    await this.repository.update(singerId, singerEntity as Singer);
  }

  async subscribe(subscribeSingerDto: SubscribeSingerDto): Promise<void> {
    const { singerId } = subscribeSingerDto;

    const singerEntity = await this.mapEntityFromTable(singerId);

    singerEntity.subscribe();

    await this.repository.update(singerId, singerEntity as Singer);
  }

  async delete(singerId: string): Promise<void> {
    const singer = await this.findOneById(singerId);

    if (!singer) throw new Error('Singer cannot be deleted');

    await this.repository.delete(singerId);
  }

  private async mapInfoFromTable(
    singerTables: SingerTable[],
  ): Promise<SingerInfoDto[]> {
    const singerEntities: SingerInfoDto[] = [];

    singerTables.map((singer) => {
      const {
        id,
        fullName,
        picture,
        registerDate,
        isSubscribed,
        subscribedDate,
        status,
      } = singer;

      singerEntities.push(
        new SingerInfoDto(
          id,
          fullName,
          picture,
          registerDate,
          isSubscribed,
          subscribedDate,
          status,
        ),
      );
    });

    return singerEntities;
  }

  async mapEntityFromTable(singerId: string): Promise<Singer> {
    const singer = await this.findOneById(singerId);

    if (!singer) throw new Error('Singer not found');

    const {
      id,
      fullName,
      picture,
      registerDate,
      isSubscribed,
      subscribedDate,
      status,
    } = singer;

    const registerDateParsed = new Date(registerDate);
    const subscribedDateParsed = new Date(subscribedDate);

    return Singer.load({
      id,
      fullName,
      picture,
      registerDate: registerDateParsed,
      isSubscribed,
      subscribedDate: subscribedDateParsed,
      status,
    });
  }
}
