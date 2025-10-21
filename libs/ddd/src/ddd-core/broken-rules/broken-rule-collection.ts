import { BrokenRule } from './broken-rule';
/**
 * Represents a collection of broken rules.
 */
export class BrokenRuleCollection {
  private _brokenRules: Array<BrokenRule> = [];

  /**
   * Creates a new instance of BrokenRuleCollection.
   * @param brokenRules - An optional array of BrokenRule objects to initialize the collection.
   */
  constructor(brokenRules?: Array<BrokenRule>) {
    if (brokenRules) this._brokenRules = brokenRules;
  }

  /**
   * Clears all the broken rules in the collection.
   */
  public clear(): void {
    this._brokenRules = [];
  }

  /**
   * Adds a broken rule to the collection.
   * @param brokenRule - The BrokenRule object to add.
   * @throws Error if the brokenRule parameter is null or undefined.
   * @throws Error if the broken rule already exists in the collection.
   */
  public add(brokenRule: BrokenRule): void {
    if (brokenRule === null || brokenRule === undefined)
      throw new Error('BrokenRule is required');

    if (this._brokenRules.includes(brokenRule))
      throw new Error('This broken rule already exists');

    this._brokenRules.push(brokenRule);
  }

  /**
   * Removes a broken rule from the collection.
   * @param brokenRule - The BrokenRule object to remove.
   * @throws Error if the broken rule does not exist in the collection.
   */
  public remove(brokenRule: BrokenRule): void {
    if (!this._brokenRules.includes(brokenRule))
      throw new Error('This broken rule does not exist');

    const index = this._brokenRules.indexOf(brokenRule);
    this._brokenRules.splice(index, 1);
  }

  /**
   * Returns an array of all the broken rules in the collection.
   * @returns An array of BrokenRule objects.
   */
  public getItems(): Array<BrokenRule> {
    return this._brokenRules;
  }

  /**
   * Returns a string representation of the broken rules in the collection.
   * @returns A string containing the code and description of each broken rule, separated by a new line.
   */
  public asString(): string {
    let result = '';

    this.getItems().forEach((brokenRule) => {
      result += `${brokenRule.code}-${brokenRule.description}` + '\n';
    });

    return result;
  }

  /**
   * Checks if the collection has any broken rules.
   * @returns True if the collection has broken rules, false otherwise.
   */
  public hasBrokenRules(): boolean {
    return this._brokenRules.length > 0;
  }

  /**
   * Merges another BrokenRuleCollection into this collection.
   * @param brokenRuleCollection - The BrokenRuleCollection to merge.
   * @throws Error if the brokenRuleCollection parameter is null or undefined.
   */
  public merge(brokenRuleCollection: BrokenRuleCollection): void {
    if (brokenRuleCollection === null || brokenRuleCollection === undefined)
      throw new Error('BrokenRuleCollection is required');

    const items = brokenRuleCollection.getItems();

    for (const item of items) {
      this.add(item);
    }
  }

  /**
   * Checks if this collection is equal to another BrokenRuleCollection.
   * @param object - The BrokenRuleCollection to compare.
   * @returns True if the collections are equal, false otherwise.
   */
  public equals(object?: BrokenRuleCollection): boolean {
    if (object === null || object === undefined) return false;

    return JSON.stringify(this) === JSON.stringify(object);
  }
}
