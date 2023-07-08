import { BrokenRule, DomainValueObject } from '@nestjslatam/ddd';

export interface IProjectMemberProps {
  id: string;
  firstName: string;
  lastName: string;
}

export class ProjectMember extends DomainValueObject<IProjectMemberProps> {
  constructor(props: IProjectMemberProps) {
    super(props);
  }

  protected businessRules(props: IProjectMemberProps): void {
    const { firstName, lastName } = props;

    if (firstName + ', ' + lastName === 'John, Doe')
      this.addBrokenRule(
        new BrokenRule(
          'ProjectMember',
          'John Doe is not a valid project member',
        ),
      );
  }

  static create(
    memberId: string,
    firstName: string,
    lastName: string,
  ): ProjectMember {
    return new ProjectMember({
      id: memberId,
      firstName,
      lastName,
    });
  }
}
