import { BrokenRule, DomainValueObject } from '@nestjslatam/ddd';

export interface IProjectMemberProps {
  id: string;
  fullName: string;
  role: string;
}

export class ProjectMember extends DomainValueObject<IProjectMemberProps> {
  constructor(props: IProjectMemberProps) {
    super(props);
  }

  protected businessRules(props: IProjectMemberProps): void {
    const { role, fullName } = props;

    if (!role === null || role === undefined)
      this.addBrokenRule(new BrokenRule('Role', 'Rol is required'));

    if (!fullName === null || fullName === undefined)
      this.addBrokenRule(new BrokenRule('FullName', 'FullName is required'));
  }

  static create(
    memberId: string,
    fullName: string,
    role: string,
  ): ProjectMember {
    return new ProjectMember({
      id: memberId,
      fullName,
      role,
    });
  }
}
