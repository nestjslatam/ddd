import {
  BrokenRule,
  DomainAggregateRoot,
  DomainAudit,
  TrackingProps,
} from '@nestjslatam/ddd-lib';

import { Id, SubscribedDate, RegisterDate } from '../../shared';
import { Song } from './song';
import { FullName } from './fullname-field';
import { PicturePath } from './picture-field';
import {
  SingerCreatedDomainEvent,
  SingerSubscribedDomainEvent,
} from './events';
import { ISingerProps, ISingerRaw, eSingerStatus } from './interfaces';

export class Singer extends DomainAggregateRoot<ISingerProps> {
  protected businessRules(props: ISingerProps): void {
    if (props.isSubscribed && !props.subscribedDate)
      this.addBrokenRule(
        new BrokenRule(
          'singer',
          'if singer is subscribed, subscribed date is required',
        ),
      );
  }

  constructor(id, props: ISingerProps, trackingProps: TrackingProps) {
    super(id, props, trackingProps);

    if (this.trackingProps) {
      this.addDomainEvent(
        new SingerCreatedDomainEvent(this.id, props.fullName.unpack()),
      );
    }
  }

  static create(props: ISingerProps): Singer {
    const { status, audit } = props;

    return new Singer(
      Id.create(),
      {
        ...props,
        status: eSingerStatus[status],
        audit,
      },
      TrackingProps.setNew(),
    );
  }

  static mapFromRaw(props: ISingerRaw): Singer {
    const {
      id,
      fullName,
      picture,
      registerDate,
      isSubscribed,
      subscribedDate,
      songs,
      status,
    } = props;

    return new Singer(
      Id.fromRaw(id),
      {
        fullName: FullName.create(fullName),
        picture: PicturePath.create(picture),
        registerDate: RegisterDate.create(registerDate),
        isSubscribed,
        songs: songs?.map((song) => Song.fromRaw(song)),
        subscribedDate: subscribedDate
          ? SubscribedDate.create(subscribedDate)
          : null,
        status: eSingerStatus[status],
        audit: DomainAudit.getFromRaw(props.audit),
      },
      TrackingProps.setDirty(),
    );
  }

  private update(audit: DomainAudit): void {
    this.props.audit.update(audit.unpack().updatedBy, audit.unpack().updatedAt);
    this.markAsDirty();
  }

  changeFullName(fullName: FullName, audit: DomainAudit): this {
    this.props.fullName = fullName;
    this.update(audit);
    return this;
  }

  changePicture(picture: PicturePath, audit: DomainAudit): this {
    this.props.picture = picture;
    this.update(audit);
    return this;
  }

  subscribe(audit: DomainAudit): this {
    if (this.props.isSubscribed)
      this.addBrokenRule(new BrokenRule('singer', 'singer already subscribed'));

    this.props.isSubscribed = true;
    this.props.subscribedDate = SubscribedDate.create(new Date());
    this.props.status = eSingerStatus.Subscribed;
    this.update(audit);

    const { subscribedDate } = this.props;

    this.addDomainEvent(
      new SingerSubscribedDomainEvent(this.id, subscribedDate.unpack()),
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

  addSong(song: Song, audit: DomainAudit): this {
    this.props.songs = this.addChild(this, song, this.props.songs);
    this.update(audit);
    return this;
  }

  removeSong(song: Song, audit: DomainAudit): this {
    this.removeChild(this, song, this.props.songs);
    this.update(audit);
    return this;
  }
}
