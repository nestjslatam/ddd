import { PrimaryColumn, Column, Entity, CreateDateColumn } from 'typeorm';

import { Audit } from './audit.table';

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

  @Column({ nullable: true, default: 'registered' })
  status: string;

  @Column(() => Audit, { prefix: false })
  audit: Audit;
}
