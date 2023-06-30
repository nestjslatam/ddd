import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { TeamMemberTable } from './team-member.table';
import { Audit } from './audit.entity';

@Entity({ name: 'teams' })
export class TeamTable {
  @PrimaryColumn()
  teamId: string;

  @Column()
  name: string;

  @OneToMany(() => TeamMemberTable, (member) => member.team)
  members: TeamMemberTable[];

  @Column(() => Audit)
  audit: Audit;
}
