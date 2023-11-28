import { DomainGuard } from './../../helpers';

export class BrokenRule {
  constructor(
    public code: string,
    public description: string,
  ) {
    this.guard(code, description);

    this.code = code;
    this.description = description;
  }

  protected guard(code: string, description: string): void {
    if (DomainGuard.isEmpty(code))
      throw new Error('BusinessRule code is required');
    if (DomainGuard.isEmpty(description))
      throw new Error('BusinessRule description is required');
  }
}
