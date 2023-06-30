import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { ProjectTable } from './project.table';
import { MemberTable } from './member.table';
import { Audit } from './audit.entity';

@Entity({ name: 'project-members' })
export class ProjectMemberTable {
  @PrimaryColumn()
  projectMemberId: string;

  @ManyToOne(() => ProjectTable, (team) => team.members)
  project: ProjectTable;

  @ManyToOne(() => MemberTable, (m) => m.projects)
  member: MemberTable;

  @Column()
  projectRole: string;

  @Column(() => Audit)
  audit: Audit;
}
