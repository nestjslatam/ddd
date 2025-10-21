import { Id, Name, RegisterDate, SubscribedDate } from '../../shared';
import { FullName } from './fullname-field';
import { PicturePath } from './picture-field';
import { Song } from './song';
import { DomainAudit, IDomainAuditProps } from '@nestjslatam/ddd-lib';

export enum eSingerStatus {
  Registered = 'registered',
  Subscribed = 'subscribed',
}

export interface ISongRaw {
  songId: string;
  songName: string;
  singerId: string;
  status: string;
  audit: IDomainAuditProps;
}

export interface ISingerRaw {
  id: string;
  fullName: string;
  songs?: ISongRaw[];
  picture?: string;
  registerDate: Date;
  isSubscribed: boolean;
  subscribedDate?: Date;
  status: string;
  audit: IDomainAuditProps;
}

export interface ISingerProps {
  fullName: FullName;
  songs?: Song[];
  picture?: PicturePath;
  registerDate: RegisterDate;
  isSubscribed: boolean;
  subscribedDate?: SubscribedDate;
  status: eSingerStatus;
  audit: DomainAudit;
}

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

export interface ISongRaw {
  id: string;
  name: string;
  singerId: string;
  status: string;
  audit: IDomainAuditProps;
}
