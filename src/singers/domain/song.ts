/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BrokenRule,
  DomainAudit,
  DomainEntity,
  TrackingProps,
} from '@nestjslatam/ddd-lib';

import { Id, Name } from '../../shared';
import { ISongProps, ISongRaw, eSongStatus } from './interfaces';

export class Song extends DomainEntity<ISongProps> {
  protected businessRules(props: ISongProps): void {
    const { name, status } = props;

    if (!name) {
      this.addBrokenRule(new BrokenRule('name', 'Name is required'));
    }

    if (status === eSongStatus.INACTIVE) {
      this.addBrokenRule(new BrokenRule('status', 'Status is inactive'));
    }
  }

  constructor(props: ISongProps, trackingProps: TrackingProps) {
    super({
      id: Id.create(),
      props,
      trackingProps,
    });
  }

  static create(singerId: Id, name: Name, audit: DomainAudit): Song {
    const song = new Song(
      { singerId, name, status: eSongStatus.ACTIVE, audit },
      TrackingProps.setNew(),
    );

    return song;
  }

  static fromRaw(props: ISongRaw): Song {
    const { singerId, name, status } = props;

    const audit = DomainAudit.getFromRaw(props.audit);

    return new Song(
      {
        singerId: Id.fromRaw(singerId),
        name: Name.create(name),
        status: eSongStatus[status],
        audit,
      },
      TrackingProps.setDirty(),
    );
  }
}
