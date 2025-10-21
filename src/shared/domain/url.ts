import { AbstractDomainString } from '../../../libs/ddd/src';

export class Url extends AbstractDomainString {
  protected businessRules(props: { value: string }): void {
    // this is a good place to add business rules
    console.log(props);
  }

  static create(value: string): Url {
    return new Url(value);
  }
}
