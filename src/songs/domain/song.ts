import {
  BrokenRule,
  DomainAggregateRoot,
  DomainAuditValueObject,
  DomainGuard,
} from '@nestjslatam/ddd-lib';
import {
  DateTimeHelper,
  ITrackingProps,
  TrackingProps,
} from '@nestjslatam/ddd';

import { Id, Name, Url } from '../../shared/domain';
import { Lyric } from './lyrics';
import { SongSinger } from './song-singer';
import { Description } from './description';
import { SongDraftedEvent } from './domain-events/song-drafted-event';

interface ISongProps {
  singer: SongSinger;
  name: Name;
  description: Description;
  lyric: Lyric;
  url: Url;
  status: eSongStatus;
}

interface ISongLoadProps {
  id: string;
  singer: { id: string; name: string };
  name: string;
  description: string;
  url: string;
  lyric: string;
  status: string;
}

export enum eSongStatus {
  CREATED = 'created',
  DRAFTED = 'drafted',
  PUBLISHED = 'published',
}

export class Song extends DomainAggregateRoot<ISongProps> {
  constructor(
    id: Id,
    props: ISongProps,
    trackingProps: ITrackingProps,
    audit: DomainAuditValueObject,
  ) {
    super({
      id,
      props,
      trackingProps: trackingProps,
      audit,
    });
  }

  static create(props: ISongProps): Song {
    return new Song(
      Id.create(),
      { ...props },
      TrackingProps.setNew(),
      DomainAuditValueObject.create('admin', DateTimeHelper.getUtcDate()),
    );
  }

  static load(props: ISongLoadProps): Song {
    const { id, name, description, lyric, url, status } = props;

    const song = new Song(
      Id.load(id),
      {
        singer: SongSinger.load(props.singer.id, props.singer.name),
        name: Name.create(name),
        description: Description.create(description),
        lyric: Lyric.create(lyric),
        url: Url.create(url),
        status: eSongStatus[status],
      },
      TrackingProps.setDirty(),
      DomainAuditValueObject.create('admin', DateTimeHelper.getUtcDate()),
    );

    return song;
  }

  protected businessRules(props: ISongProps): void {
    if (DomainGuard.isEmpty(props.name) && DomainGuard.isEmpty(props.url)) {
      this.addBrokenRule(new BrokenRule('name', 'name or url is required'));
    }

    const { isNew } = this.getTrackingProps();

    if (!isNew && DomainGuard.isEmpty(props.singer)) {
      this.addBrokenRule(new BrokenRule('artist', 'artist is required'));
    }
  }

  update(description: Description, url: Url): void {
    this.props.description = description;
    this.props.url = url;
    this.updateAudit();
  }

  assignArtist(singer: SongSinger): void {
    this.props.singer = singer;
    this.updateAudit();
  }

  changeName(name: Name): void {
    this.props.name = name;
    this.updateAudit();
  }

  uploadLyric(lyric: Lyric): void {
    this.props.lyric = lyric;
    this.updateAudit();
  }

  setDraft(): void {
    if (this.getPropsCopy().status !== eSongStatus.CREATED)
      this.addBrokenRule(
        new BrokenRule('status', 'song must be created before to be drafted'),
      );

    this.props.status = eSongStatus.DRAFTED;
    this.updateAudit();

    const { name } = this.getPropsCopy();

    this.addDomainEvent(new SongDraftedEvent(this.getId(), name));
  }

  setPublish(): void {
    if (this.getPropsCopy().status !== eSongStatus.DRAFTED)
      this.addBrokenRule(
        new BrokenRule('status', 'song must be drafted before to be published'),
      );

    this.props.status = eSongStatus.PUBLISHED;
    this.updateAudit();

    const { name } = this.getPropsCopy();

    this.addDomainEvent(new SongDraftedEvent(this.getId(), name));
  }

  private updateAudit(): void {
    this.getAudit().update('admin', DateTimeHelper.getUtcDate());
  }
}
