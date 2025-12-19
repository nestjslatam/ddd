import { DomainUid } from '@nestjslatam/ddd-lib';

import { v4 } from 'uuid';

// Id is an alias for DomainUid to maintain compatibility
export class Id extends DomainUid {
  static create(): Id {
    return new Id(v4().toString());
  }

  static fromRaw(value: string): Id {
    return new Id(value);
  }

  static load(value: string): Id {
    return new Id(value);
  }
}
