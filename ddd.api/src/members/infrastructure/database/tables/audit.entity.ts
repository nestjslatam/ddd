import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

export class Audit {
  @Column()
  createdBy: string;
  @CreateDateColumn()
  createdDate: Date;
  @Column()
  updatedBy: string;
  @UpdateDateColumn()
  updatedDate: Date;
  @Column()
  timestamp: number;
  @VersionColumn()
  version: number;
}
