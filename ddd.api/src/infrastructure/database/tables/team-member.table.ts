import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { TeamTable } from './team.table';
import { MemberTable } from './member.table';
import { Audit } from './audit.entity';

@Entity({ name: 'team-members' })
export class TeamMemberTable {
  @PrimaryColumn()
  teamMemberId: string;

  @Column()
  role: string;

  @Column()
  emailAddress: string;

  @ManyToOne(() => TeamTable, (team) => team.members)
  team: TeamTable;

  @ManyToOne(() => MemberTable, (m) => m.teams)
  member: MemberTable;

  @Column(() => Audit)
  audit: Audit;
}
