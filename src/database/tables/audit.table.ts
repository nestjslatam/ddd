import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class Audit {
  @Column()
  createdBy: string;
  @CreateDateColumn()
  createdAt: Date;
  @Column({ nullable: true })
  updatedBy?: string;
  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date;
  @Column({ type: 'bigint' })
  timestamp?: number;
}
