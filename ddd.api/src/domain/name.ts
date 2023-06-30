import { DomainStringValueObject } from '@nestjslatam/ddd';

export class Name extends DomainStringValueObject {
  private constructor(value: string) {
    super(value);
  }
}
