import { Column, Entity, PrimaryColumn } from 'typeorm';
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

  @Column(() => Audit)
  audit: Audit;
}
