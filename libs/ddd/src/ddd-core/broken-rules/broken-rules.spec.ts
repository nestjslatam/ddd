import { BrokenRule } from './broken-rule';
import { BrokenRuleCollection } from './broken-rule-collection';

describe('BrokenRule', () => {
  it('should create a broken rule with a code and description', () => {
    const brokenRule = new BrokenRule('code', 'description');
    expect(brokenRule.code).toBe('code');
    expect(brokenRule.description).toBe('description');
  });
});

describe('BrokenRuleCollection', () => {
  let collection: BrokenRuleCollection;

  beforeEach(() => {
    collection = new BrokenRuleCollection();
  });

  it('should be empty initially', () => {
    expect(collection.hasBrokenRules()).toBe(false);
    expect(collection.getItems()).toHaveLength(0);
  });

  it('should add a broken rule', () => {
    const rule = new BrokenRule('code', 'description');
    collection.add(rule);
    expect(collection.hasBrokenRules()).toBe(true);
    expect(collection.getItems()).toHaveLength(1);
    expect(collection.getItems()[0]).toBe(rule);
  });

  it('should throw when adding a null broken rule', () => {
    expect(() => collection.add(null as any)).toThrow('BrokenRule is required');
  });

  it('should not add a duplicate rule', () => {
    const rule = new BrokenRule('code', 'description');
    collection.add(rule);
    expect(() => collection.add(rule)).toThrow(
      'This broken rule already exists',
    );
  });

  it('should remove a broken rule', () => {
    const rule = new BrokenRule('code', 'description');
    collection.add(rule);
    collection.remove(rule);
    expect(collection.hasBrokenRules()).toBe(false);
  });

  it('should throw when removing a non-existent rule', () => {
    const rule = new BrokenRule('code', 'description');
    expect(() => collection.remove(rule)).toThrow(
      'This broken rule does not exist',
    );
  });

  it('should clear all rules', () => {
    collection.add(new BrokenRule('1', 'one'));
    collection.add(new BrokenRule('2', 'two'));
    collection.clear();
    expect(collection.hasBrokenRules()).toBe(false);
  });

  it('should merge with another collection', () => {
    const otherCollection = new BrokenRuleCollection();
    otherCollection.add(new BrokenRule('2', 'two'));
    collection.add(new BrokenRule('1', 'one'));
    collection.merge(otherCollection);
    expect(collection.getItems()).toHaveLength(2);
  });

  it('should throw when merging a null collection', () => {
    expect(() => collection.merge(null as any)).toThrow('BrokenRuleCollection is required');
  });

  it('should return a formatted string of rules', () => {
    collection.add(new BrokenRule('1', 'one'));
    collection.add(new BrokenRule('2', 'two'));
    expect(collection.asString()).toBe('1-one\n2-two\n');
  });

  it('should be equal to another collection with the same rules', () => {
    const otherCollection = new BrokenRuleCollection();
    const rule1 = new BrokenRule('1', 'one');
    const rule2 = new BrokenRule('2', 'two');
    collection.add(rule1);
    collection.add(rule2);
    otherCollection.add(rule1);
    otherCollection.add(rule2);
    expect(collection.equals(otherCollection)).toBe(true);
  });

  it('should not be equal to another collection with different rules', () => {
    const otherCollection = new BrokenRuleCollection();
    collection.add(new BrokenRule('1', 'one'));
    otherCollection.add(new BrokenRule('2', 'two'));
    expect(collection.equals(otherCollection)).toBe(false);
  });
});
