import {
  PrimaryColumn,
  Column,
  Entity,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { Audit } from './audit.table';
import { Song } from './song.table';

@Entity('singers')
export class Singer {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  picture: string;

  @CreateDateColumn()
  registerDate?: Date;

  @Column({ default: false })
  isSubscribed: boolean;

  @Column({ nullable: true })
  subscribedDate?: Date;

  @OneToMany(() => Song, (song) => song.singer, { nullable: true })
  songs: Song[];

  @Column()
  status: string;

  @Column(() => Audit)
  audit: Audit;
}
