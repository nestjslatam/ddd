import {
  PrimaryColumn,
  Column,
  Entity,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Audit } from './audit.table';
import { Singer } from './singer.table';

@Entity('songs')
export class Song {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Singer, (singer) => singer.songs, { cascade: true })
  @JoinColumn({ name: 'singer_id', referencedColumnName: 'id' })
  singer!: Singer;

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn()
  registerDate?: Date;

  @Column({ nullable: true, default: 'registered' })
  status: string;

  @Column(() => Audit, { prefix: false })
  audit: Audit;
}
