import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ProjectMemberTable } from './project-member.table';
import { Audit } from './audit.entity';

@Entity({ name: 'projects' })
export class ProjectTable {
  @PrimaryColumn()
  projectId: string;

  @Column()
  name: string;

  @OneToMany(() => ProjectMemberTable, (member) => member.project)
  members: ProjectMemberTable[];

  @Column()
  status: string;

  @Column(() => Audit)
  audit: Audit;
}
