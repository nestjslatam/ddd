import { StringValueObject } from '@nestjslatam/ddd-lib';

export class Description extends StringValueObject {
  constructor(value: string) {
    super(value);
  }

  static create(value: string): Description {
    return new Description(value);
  }

  static load(value: string): Description {
    return new Description(value);
  }
}
