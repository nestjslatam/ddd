import { Column } from 'typeorm';

export class Audit {
  @Column()
  createdBy: string;
  @Column()
  createdAt: Date;
  @Column({ nullable: true })
  updatedBy: string;
  @Column({ nullable: true })
  updatedAt: Date;
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
