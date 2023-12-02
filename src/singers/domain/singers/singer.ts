/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BrokenRule,
  DomainAggregateRoot,
  DomainAuditValueObject,
  TrackingProps,
} from '@nestjslatam/ddd-lib';

import { Id, SubscribedDate, RegisterDate } from '../../../shared';
import { Song, eSongStatus } from './song';
import { FullName } from './fullname-field';
import { PicturePath } from './picture-field';
import {
  SingerCreatedDomainEvent,
  SingerSubscribedDomainEvent,
} from './../domain-events';

interface ISingerProps {
  fullName: FullName;
  songs?: Song[];
  picture?: PicturePath;
  registerDate: RegisterDate;
  isSubscribed: boolean;
  subscribedDate?: SubscribedDate;
  status: eSingerStatus;
  audit: DomainAuditValueObject;
}

interface ISingerLoadProps {
  id: string;
  fullName: string;
  songs?: {
    songId: string;
    songName: string;
    singerId: string;
    status: string;
    audit: {
      createdBy: string;
      createdDate: Date;
      updatedBy: string;
      updatedDate: Date;
      timestamp: number;
    };
  }[];
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
    timestamp: number;
  };
}

export enum eSingerStatus {
  Registered = 'registered',
  Subscribed = 'subscribed',
}

export class Singer extends DomainAggregateRoot<ISingerProps> {
  constructor(id, props: ISingerProps, trackingProps: TrackingProps) {
    super({
      id,
      props,
      trackingProps,
    });

    if (this.getTrackingProps().isNew) {
      this.addDomainEvent(
        new SingerCreatedDomainEvent(this.getId(), props.fullName.unpack()),
      );
    }
  }

  static create(props: ISingerProps): Singer {
    const {
      fullName,
      picture,
      registerDate,
      isSubscribed,
      subscribedDate,
      status,
      audit,
    } = props;

    return new Singer(
      Id.create(),
      {
        fullName,
        picture,
        registerDate,
        isSubscribed,
        subscribedDate,
        status: eSingerStatus[status],
        audit,
      },
      TrackingProps.setNew(),
    );
  }

  static load(props: ISingerLoadProps): Singer {
    const {
      id,
      fullName,
      picture,
      registerDate,
      isSubscribed,
      subscribedDate,
      songs,
      audit: { createdBy, createdDate, updatedBy, updatedDate, timestamp },
      status,
    } = props;

    const audit = DomainAuditValueObject.load({
      createdBy,
      createdAt: createdDate,
      updatedBy,
      updatedAt: updatedDate,
      timestamp,
    });

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
            singerId: id,
            status: song.status,
            audit: {
              createdBy: song.audit.createdBy,
              createdDate: song.audit.createdDate,
              updatedBy: song.audit.updatedBy,
              updatedDate: song.audit.updatedDate,
              timestamp: song.audit.timestamp,
            },
          }),
        ),
        subscribedDate: subscribedDate
          ? SubscribedDate.create(subscribedDate)
          : null,
        status: eSingerStatus[status],
        audit,
      },
      TrackingProps.setDirty(),
    );

    return singer;
  }

  changeFullName(fullName: FullName, audit: DomainAuditValueObject): this {
    this.props.fullName = fullName;
    this.update(audit);

    return this;
  }

  changePicture(picture: PicturePath, audit: DomainAuditValueObject): this {
    this.props.picture = picture;
    this.update(audit);

    return this;
  }

  subscribe(audit: DomainAuditValueObject): this {
    if (this.props.isSubscribed)
      this.addBrokenRule(new BrokenRule('singer', 'singer already subscribed'));

    this.props.isSubscribed = true;
    this.props.subscribedDate = SubscribedDate.create(new Date());
    this.props.status = eSingerStatus.Subscribed;
    this.update(audit);

    const { subscribedDate } = this.props;

    this.addDomainEvent(
      new SingerSubscribedDomainEvent(this.getId(), subscribedDate.unpack()),
    );

    return this;
  }

  remove(): this {
    if (this.props.status === eSingerStatus.Subscribed)
      this.addBrokenRule(
        new BrokenRule('singer', 'singer is subscribed, cannot remove'),
      );

    return this;
  }

  protected businessRules(props: ISingerProps): void {}

  addSong(song: Song, audit: DomainAuditValueObject): this {
    this.addChild(this, song, this.props.songs);

    this.update(audit);

    return this;
  }

  removeSong(song: Song, audit: DomainAuditValueObject): this {
    this.removeChild(this, song, this.props.songs);

    this.update(audit);

    return this;
  }

  private update(audit: DomainAuditValueObject): void {
    this.props.audit.update(audit.unpack().updatedBy, audit.unpack().updatedAt);
    this.setTrackingProps(TrackingProps.setDirty());
  }
}
