import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';
import { Audit } from './audit.entity';
import { MemberTable } from './member.table';

@Entity({ name: 'projects' })
export class ProjectTable {
  @PrimaryColumn()
  projectId: string;

  @Column()
  name: string;

  @ManyToMany(() => MemberTable)
  @JoinTable()
  members: MemberTable[];

  @Column()
  status: string;

  @Column(() => Audit)
  audit: Audit;
}
