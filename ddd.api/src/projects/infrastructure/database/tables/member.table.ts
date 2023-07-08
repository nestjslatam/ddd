import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Audit } from './audit.entity';

@Entity({ name: 'members' })
export class MemberTable {
  @PrimaryColumn()
  memberId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  status: string;

  @Column(() => Audit)
  audit: Audit;
}
