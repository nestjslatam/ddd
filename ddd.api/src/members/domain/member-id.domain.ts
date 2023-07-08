import { DomainUIdValueObject, IDomainPrimitive } from '@nestjslatam/ddd';
import { v4 } from 'uuid';

export class MemberId extends DomainUIdValueObject {
  constructor(id: string) {
    super(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  protected businessRules(props: IDomainPrimitive<string>): void {}

  static create(): MemberId {
    return new MemberId(v4().toString());
  }
}
