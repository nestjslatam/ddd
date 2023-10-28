/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BrokenRule,
  DomainAggregateRoot,
  DomainAuditValueObject,
} from '@nestjslatam/ddd-lib';

import { Id, SubscribedDate, RegisterDate } from '../../shared/domain';
import { FullName } from './fullname';
import { PicturePath } from './picture-path';
import { SingerSong } from './singer-song';
import { RegisteredSingerEvent, SubscribedSingerEvent } from './domain-events';
import { UploadedPictureEvent } from './domain-events/uploaded-picture';

interface ISingerProps {
  id: Id;
  fullName: FullName;
  picture?: PicturePath;
  registerDate: RegisterDate;
  isSubscribed: boolean;
  subscribedDate?: SubscribedDate;
  songs?: SingerSong[];
  status: eSingerStatus;
}

interface ISongLoadProps {
  id: string;
  fullName: string;
  picture?: string;
  registerDate: Date;
  isSubscribed: boolean;
  subscribedDate?: Date;
  songs?: { songId: string; songName: string }[];
  status: string;
}

export enum eSingerStatus {
  REGISTERED = 'registered',
  SUBSCRIBED = 'subscribed',
}

export class Singer extends DomainAggregateRoot<ISingerProps> {
  constructor(props: ISingerProps) {
    super({
      id: props.id,
      props,
      audit: DomainAuditValueObject.create('admin', new Date()),
    });

    if (this.getTrackingStatus().isNew) {
      this.addDomainEvent(
        new RegisteredSingerEvent(props.id.unpack(), props.fullName.unpack()),
      );
    }
  }

  static create(props: ISingerProps): Singer {
    const {
      id,
      fullName,
      picture,
      registerDate,
      isSubscribed,
      subscribedDate,
    } = props;

    const singer = new Singer({
      id,
      fullName,
      picture,
      registerDate,
      isSubscribed,
      subscribedDate,
      status: eSingerStatus.REGISTERED,
    });

    return singer;
  }

  static load(props: ISongLoadProps): Partial<Singer> {
    const {
      id,
      fullName,
      picture,
      registerDate,
      isSubscribed,
      subscribedDate,
      status,
    } = props;

    const singer = {
      id: Id.load(id),
      fullName: FullName.load(fullName),
      picture: PicturePath.create(picture),
      registerDate: RegisterDate.create(registerDate),
      isSubscribed: isSubscribed,
      subscribedDate: subscribedDate
        ? SubscribedDate.create(subscribedDate)
        : null,
      status: eSingerStatus[status],
    } as Partial<Singer>;

    singer.marAsDirty();

    return singer;
  }

  uploadPicture(picture: PicturePath): void {
    this.props.picture = picture;
    this.updateAudit();

    this.addDomainEvent(
      new UploadedPictureEvent(this.props.id.unpack(), picture.unpack()),
    );
  }

  subscribe(): void {
    if (this.props.isSubscribed)
      this.addBrokenRule(new BrokenRule('singer', 'singer already subscribed'));

    this.props.isSubscribed = true;
    this.props.subscribedDate = SubscribedDate.create(new Date());
    this.props.status = eSingerStatus.SUBSCRIBED;
    this.updateAudit();

    const { id, fullName } = this.props;

    this.addDomainEvent(
      new SubscribedSingerEvent(id.unpack(), fullName.unpack()),
    );
  }

  changeName(newfullName: FullName): void {
    this.props.fullName = newfullName;
    this.updateAudit();
  }

  protected businessRules(props: ISingerProps): void {
    //
  }

  private updateAudit(): void {
    this.getAudit().update('admin', new Date());
    this.marAsDirty();
  }
}
