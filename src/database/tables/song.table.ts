import {
  PrimaryColumn,
  Column,
  Entity,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Audit } from './audit.table';
import { Singer } from './singer.table';

@Entity('songs')
export class Song {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  lyric: string;

  @Column({ nullable: true })
  url: string;

  @CreateDateColumn()
  registerDate?: Date;

  @ManyToOne(() => Singer, (singer) => singer.songs)
  singer: Singer;

  @Column()
  status: string;

  @Column(() => Audit)
  audit: Audit;
}
