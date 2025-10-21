import { DomainIdAsString, IDomainPrimitive } from '@nestjslatam/ddd-lib';

import { v4 } from 'uuid';

export class Id extends DomainIdAsString {
  protected constructor(value: string) {
    super(value);

    this.businessRules({ value });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected businessRules(props: IDomainPrimitive<string>): void {
    //
  }

  static create(): Id {
    return new Id(v4().toString());
  }

  static fromRaw(value: string): Id {
    return new Id(value);
  }
}
