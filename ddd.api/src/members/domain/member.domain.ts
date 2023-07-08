import {
  BrokenRule,
  DateTimeHelper,
  DomainAuditValueObject,
  DomainEntity,
} from '@nestjslatam/ddd';
import { MemberId } from './member-id.domain';
import { FirstName } from './first-name.domain';
import { LastName } from './last-name.domain';

export interface IMemberProps {
  firstName: FirstName;
  LastName: LastName;
}

export class Member extends DomainEntity<IMemberProps> {
  constructor(props: IMemberProps) {
    super({
      id: MemberId.create(),
      props,
      audit: DomainAuditValueObject.create('todo', DateTimeHelper.getUtcDate()),
    });
  }

  protected businessRules(props: IMemberProps): void {
    const { firstName, LastName } = props;

    if (firstName.unpack() + ' ' + LastName.unpack() === 'John Doe')
      this.addBrokenRule(
        new BrokenRule(
          this.constructor.name,
          'Invalid Member name. The value should be a string with 3 and 150 characters',
        ),
      );
  }

  static create(firstName: FirstName, LastName: LastName): Member {
    return new Member({
      firstName,
      LastName,
    });
  }
}
