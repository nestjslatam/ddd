import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { ProjectTable } from './project.table';
import { Audit } from './audit.entity';

@Entity({ name: 'project-members' })
export class ProjectMemberTable {
  @PrimaryColumn()
  projectMemberId: string;

  @ManyToOne(() => ProjectTable, (team) => team.members)
  project: ProjectTable;

  @Column()
  projectRole: string;

  @Column(() => Audit)
  audit: Audit;
}
