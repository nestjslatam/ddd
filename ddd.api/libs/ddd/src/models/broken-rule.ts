import { DomainGuard } from '../helpers';

export class BrokenRule {
  constructor(public code: string, public description: string) {
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

export class BrokenRuleCollection {
  private _brokenRules: Array<BrokenRule> = [];

  constructor(brokenRules?: Array<BrokenRule>) {
    if (brokenRules) this._brokenRules = brokenRules;
  }

  public add(brokenRule: BrokenRule): void {
    if (brokenRule === null || brokenRule === undefined)
      throw new Error('BrokenRule is required');

    if (this._brokenRules.includes(brokenRule))
      throw new Error('This broken rule already exists');

    this._brokenRules.push(brokenRule);
  }

  public remove(brokenRule: BrokenRule): void {
    if (!this._brokenRules.includes(brokenRule))
      throw new Error('This broken rule does not exists');

    const index = this._brokenRules.indexOf(brokenRule);
    this._brokenRules.splice(index, 1);
  }

  public getItems(): Array<BrokenRule> {
    return this._brokenRules;
  }

  public hasBrokenRules(): boolean {
    return this._brokenRules.length > 0;
  }

  public merge(brokenRuleCollection: BrokenRuleCollection): void {
    if (brokenRuleCollection === null || brokenRuleCollection === undefined)
      throw new Error('BrokenRuleCollection is required');

    const items = brokenRuleCollection.getItems();

    for (const item of items) {
      this.add(item);
    }
  }

  public equals(object?: BrokenRuleCollection): boolean {
    if (object === null || object === undefined) return false;

    return JSON.stringify(this) === JSON.stringify(object);
  }
}
