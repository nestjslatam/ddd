import {
  BrokenRule,
  DomainGuard,
  DomainStringValueObject,
  IDomainPrimitive,
} from '@nestjslatam/ddd';

export class PicturePath extends DomainStringValueObject {
  constructor(value: string) {
    super(value);
  }

  protected businessRules(props: IDomainPrimitive<string>): void {
    if (!DomainGuard.lengthIsBetween(props.value, 3, 1500)) {
      this.addBrokenRule(
        new BrokenRule(
          'picture-path',
          'path must be between 3 and 1500 characters',
        ),
      );
    }
  }

  static create(value: string): PicturePath {
    return new PicturePath(value);
  }
}
