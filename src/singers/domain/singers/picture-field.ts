import { AbstractDomainString, IDomainPrimitive } from '@nestjslatam/ddd-lib';

export class PicturePath extends AbstractDomainString {
  protected businessRules(props: IDomainPrimitive<string>): void {
    // this is a good place to add business rules
    console.log(props);
  }

  static create(value: string): PicturePath {
    return new PicturePath(value);
  }
}
