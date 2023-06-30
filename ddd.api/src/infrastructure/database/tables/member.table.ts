import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ProjectMemberTable } from './project-member.table';
import { TeamMemberTable } from './team-member.table';
import { Audit } from './audit.entity';

@Entity({ name: 'members' })
export class MemberTable {
  @PrimaryColumn()
  memberId: string;

  @Column()
  fullName: string;

  @Column()
  emailAddress: string;

  @Column()
  phone: string;

  @OneToMany(() => ProjectMemberTable, (member) => member.member)
  projects: ProjectMemberTable[];

  @OneToMany(() => TeamMemberTable, (member) => member.member)
  teams: TeamMemberTable[];

  @Column(() => Audit)
  audit: Audit;
}
