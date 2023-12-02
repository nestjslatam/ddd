/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DomainAggregateRoot,
  DomainAuditValueObject,
  TrackingProps,
} from '@nestjslatam/ddd-lib';

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
  audit: DomainAuditValueObject;
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

export class Song extends DomainAggregateRoot<ISongProps> {
  constructor(props: ISongProps, trackingProps: TrackingProps) {
    super({
      id: Id.create(),
      props,
      trackingProps,
    });
    this.businessRules(props);
  }

  static create(singerId: Id, name: Name, audit: DomainAuditValueObject): Song {
    return new Song(
      { singerId, name, status: eSongStatus.ACTIVE, audit },
      TrackingProps.setNew(),
    );
  }

  static load(props: ISongLoadProps): Song {
    const {
      singerId,
      name,
      status,
      audit: { createdBy, createdDate, updatedBy, updatedDate, timestamp },
    } = props;

    const audit = DomainAuditValueObject.load({
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

  protected businessRules(props: ISongProps): void {
    throw new Error('Method not implemented.');
  }
}
