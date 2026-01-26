import { StringValueObject } from '@nestjslatam/ddd-lib';

export class Name extends StringValueObject {
  constructor(value: string) {
    super(value);
  }

  static create(value: string): Name {
    return new Name(value);
  }

  static load(value: string): Name {
    return new Name(value);
  }
}
