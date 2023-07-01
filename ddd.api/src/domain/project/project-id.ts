import { DomainUIdValueObject, IDomainPrimitive } from '@nestjslatam/ddd';
import { v4 } from 'uuid';

export class ProjectId extends DomainUIdValueObject {
  constructor(id: string) {
    super(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  protected businessRules(props: IDomainPrimitive<string>): void {}

  static create(): ProjectId {
    return new ProjectId(v4().toString());
  }
}
