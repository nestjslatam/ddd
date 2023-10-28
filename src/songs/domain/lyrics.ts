import {
  BrokenRule,
  DomainGuard,
  DomainStringValueObject,
  IDomainPrimitive,
} from '@nestjslatam/ddd';

export class Lyric extends DomainStringValueObject {
  protected businessRules(props: IDomainPrimitive<string>): void {
    if (!DomainGuard.lengthIsBetween(props.value, 0, 500)) {
      this.addBrokenRule(
        new BrokenRule('value', 'Lyric must be between 0 and 500 characters'),
      );
    }
  }

  constructor(value: string) {
    super(value);
  }

  static create(value: string): Lyric {
    return new Lyric(value);
  }
}
