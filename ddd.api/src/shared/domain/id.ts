import { v4 } from 'uuid';
import { DomainUIdValueObject, IDomainPrimitive } from '@nestjslatam/ddd';

export class Id extends DomainUIdValueObject {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected businessRules(props: IDomainPrimitive<string>): void {
    //
  }
  constructor(value: string) {
    super(value);
  }

  static create(): Id {
    return new Id(v4().toString());
  }

  static load(value: string): Id {
    return new Id(value);
  }
}
