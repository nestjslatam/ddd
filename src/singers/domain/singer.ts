import {
  BrokenRule,
  DomainAggregateRoot,
  DomainAuditValueObject,
  TrackingProps,
} from '@nestjslatam/ddd-lib';

import { Id, SubscribedDate, RegisterDate } from '../../shared/domain';
import { FullName } from './fullname';
import { PicturePath } from './picture-path';
import { SingerSong } from './singer-song';
import { RegisteredSingerEvent, SubscribedSingerEvent } from './domain-events';
import { UploadedPictureEvent } from './domain-events/uploaded-picture';

interface ISingerProps {
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
  constructor(
    id,
    props: ISingerProps,
    trackingProps: TrackingProps,
    audit: DomainAuditValueObject,
  ) {
    super({
      id,
      props,
      trackingProps,
      audit,
    });

    if (this.getTrackingProps().isNew) {
      this.addDomainEvent(
        new RegisteredSingerEvent(this.getId(), props.fullName.unpack()),
      );
    }
  }

  static create(props: ISingerProps): Singer {
    const { fullName, picture, registerDate, isSubscribed, subscribedDate } =
      props;

    return new Singer(
      Id.create(),
      {
        fullName,
        picture,
        registerDate,
        isSubscribed,
        subscribedDate,

        status: eSingerStatus.REGISTERED,
      },
      TrackingProps.setNew(),
      DomainAuditValueObject.create('admin', new Date()),
    );
  }

  static load(props: ISongLoadProps): Singer {
    const {
      id,
      fullName,
      picture,
      registerDate,
      isSubscribed,
      subscribedDate,
      status,
    } = props;

    const singer = new Singer(
      Id.load(id),
      {
        fullName: FullName.load(fullName),
        picture: PicturePath.create(picture),
        registerDate: RegisterDate.create(registerDate),
        isSubscribed: isSubscribed,
        subscribedDate: subscribedDate
          ? SubscribedDate.create(subscribedDate)
          : null,
        status: eSingerStatus[status],
      },
      TrackingProps.setDirty(),
      DomainAuditValueObject.create('admin', new Date()),
    );

    return singer;
  }

  uploadPicture(picture: PicturePath): void {
    this.props.picture = picture;
    this.updateAudit();

    this.addDomainEvent(
      new UploadedPictureEvent(this.getId(), picture.unpack()),
    );
  }

  subscribe(): void {
    if (this.props.isSubscribed)
      this.addBrokenRule(new BrokenRule('singer', 'singer already subscribed'));

    this.props.isSubscribed = true;
    this.props.subscribedDate = SubscribedDate.create(new Date());
    this.props.status = eSingerStatus.SUBSCRIBED;
    this.updateAudit();

    const { fullName } = this.props;

    this.addDomainEvent(
      new SubscribedSingerEvent(this.getId(), fullName.unpack()),
    );
  }

  changeName(newfullName: FullName): void {
    this.props.fullName = newfullName;
    this.updateAudit();
  }

  protected businessRules(props: ISingerProps): void {
    this.childGuard(props);
  }

  private updateAudit(): void {
    this.getAudit().update('admin', new Date());
  }
}
