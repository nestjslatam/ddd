/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BrokenRule,
  DomainAggregateRoot,
  DomainAuditValueObject,
  TrackingProps,
} from '@nestjslatam/ddd-lib';

import { Id, SubscribedDate, RegisterDate } from '../../shared/domain';
import { FullName } from './fullname';
import { PicturePath } from './picture-path';
import {
  SingerCreatedDomainEvent,
  SingerSubscribedDomainEvent,
} from './domain-events';
import { Song } from './song';

interface ISingerProps {
  fullName: FullName;
  songs?: Song[];
  picture?: PicturePath;
  registerDate: RegisterDate;
  isSubscribed: boolean;
  subscribedDate?: SubscribedDate;

  status: eSingerStatus;
}

interface ISongLoadProps {
  id: string;
  fullName: string;
  songs?: { songId: string; songName: string }[];
  picture?: string;
  registerDate: Date;
  isSubscribed: boolean;
  subscribedDate?: Date;
  status: string;
  audit: {
    createdBy: string;
    createdDate: Date;
    updatedBy: string;
    updatedDate: Date;
  };
}

export enum eSingerStatus {
  Registered = 'registered',
  Subscribed = 'subscribed',
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
        new SingerCreatedDomainEvent(this.getId(), props.fullName.unpack()),
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

        status: eSingerStatus.Registered,
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
      songs,
      audit,
      status,
    } = props;

    const singer = new Singer(
      Id.load(id),
      {
        fullName: FullName.load(fullName),
        picture: PicturePath.create(picture),
        registerDate: RegisterDate.create(registerDate),
        isSubscribed: isSubscribed,
        songs: songs?.map((song) =>
          Song.load({
            id: song.songId,
            name: song.songName,
            singerId: singer.getId().toString(),
            status: eSingerStatus[status],
            audit,
          }),
        ),
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

  subscribe(): this {
    if (this.props.isSubscribed)
      this.addBrokenRule(new BrokenRule('singer', 'singer already subscribed'));

    this.props.isSubscribed = true;
    this.props.subscribedDate = SubscribedDate.create(new Date());
    this.props.status = eSingerStatus.Subscribed;
    this.updateAudit();

    const { subscribedDate } = this.props;

    this.addDomainEvent(
      new SingerSubscribedDomainEvent(this.getId(), subscribedDate.unpack()),
    );

    return this;
  }

  protected businessRules(props: ISingerProps): void {}

  private updateAudit(): void {
    this.getAudit().update('admin', new Date());
  }

  addSong(song: Song): this {
    this.addChild(this, song, this.props.songs);

    this.update();

    return this;
  }

  removeSong(song: Song): this {
    this.removeChild(this, song, this.props.songs);

    this.update();

    return this;
  }

  private update() {
    this.updateAudit();
    this.setTrackingProps(TrackingProps.setDirty());
  }
}
