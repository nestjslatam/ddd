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
  };
}

export class Song extends DomainAggregateRoot<ISongProps> {
  constructor(
    props: ISongProps,
    trackingProps: TrackingProps,
    audit: DomainAuditValueObject,
  ) {
    super({
      id: Id.create(),
      props,
      trackingProps,
      audit,
    });
    this.businessRules(props);
  }

  static create(singerId: Id, name: Name): Song {
    return new Song(
      { singerId, name, status: eSongStatus.ACTIVE },
      TrackingProps.setNew(),
      DomainAuditValueObject.create('admin', new Date()),
    );
  }

  static load(props: ISongLoadProps): Song {
    const audit = DomainAuditValueObject.create(
      props.audit.createdBy,
      props.audit.createdDate,
    );
    audit.update(props.audit.updatedBy, props.audit.updatedDate);

    return new Song(
      {
        singerId: Id.load(props.singerId),
        name: Name.create(props.name),
        status: eSongStatus.ACTIVE,
      },
      TrackingProps.setDirty(),
      audit,
    );
  }

  protected businessRules(props: ISongProps): void {
    throw new Error('Method not implemented.');
  }
}
