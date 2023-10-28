import {
  BrokenRule,
  DomainGuard,
  DomainStringValueObject,
} from '@nestjslatam/ddd';

export class Url extends DomainStringValueObject {
  constructor(value: string) {
    super(value);
  }

  protected businessRules(props: { value: string }): void {
    if (!DomainGuard.lengthIsBetween(props.value, 3, 150)) {
      this.addBrokenRule(
        new BrokenRule('url', 'url must be between 3 and 150 characters'),
      );
    }
  }

  static create(value: string): Url {
    return new Url(value);
  }
}
