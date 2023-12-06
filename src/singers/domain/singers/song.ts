/* eslint-disable @typescript-eslint/no-unused-vars */
import { DomainAudit, DomainEntity, TrackingProps } from '@nestjslatam/ddd-lib';

import { Id, Name } from '../../../shared';

export enum eSongStatus {
  ACTIVE = 'active',
  PUBLISHING = 'publishing',
  PUBLISHED = 'published',
  INACTIVE = 'inactive',
}

export interface ISongProps {
  singerId: Id;
  name: Name;
  status: eSongStatus;
  audit: DomainAudit;
}

export interface ISongLoadProps {
  id: string;
  name: string;
  singerId: string;
  status: string;
  audit: {
    createdBy: string;
    createdDate: Date;
    updatedBy: string;
    updatedDate: Date;
    timestamp: number;
  };
}

export class Song extends DomainEntity<ISongProps> {
  protected businessRules(props: ISongProps): void {
    //
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

  static load(props: ISongLoadProps): Song {
    const {
      singerId,
      name,
      status,
      audit: { createdBy, createdDate, updatedBy, updatedDate, timestamp },
    } = props;

    const audit = DomainAudit.create({
      createdBy,
      createdAt: createdDate,
      updatedBy,
      updatedAt: updatedDate,
      timestamp,
    });

    return new Song(
      {
        singerId: Id.load(singerId),
        name: Name.create(name),
        status: eSongStatus[status],
        audit,
      },
      TrackingProps.setDirty(),
    );
  }
}
