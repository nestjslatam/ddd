import { BrokenRule } from './broken-rule';

export class BrokenRuleCollection {
  private _brokenRules: Array<BrokenRule> = [];

  constructor(brokenRules?: Array<BrokenRule>) {
    if (brokenRules) this._brokenRules = brokenRules;
  }

  public clear(): void {
    this._brokenRules = [];
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
