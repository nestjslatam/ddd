
import { jest } from '@jest/globals';
import { AbstractValidator, DomainValidator, ValueObjectValidator } from './impl';
import { DomainEntity, AbstractDomainValueObject, IDomainPrimitive } from '../ddd-core/ddd-base-classes';

describe('AbstractValidator', () => {
  it('should check if a value is not an object', () => {
    expect(AbstractValidator.isNotAndObject(1)).toBe(true);
    expect(AbstractValidator.isNotAndObject('a')).toBe(true);
    expect(AbstractValidator.isNotAndObject(true)).toBe(true);
    expect(AbstractValidator.isNotAndObject({})).toBe(false);
  });

  it('should check if a value is undefined or null', () => {
    expect(AbstractValidator.isUndefinedOrNull(undefined)).toBe(true);
    expect(AbstractValidator.isUndefinedOrNull(null)).toBe(true);
    expect(AbstractValidator.isUndefinedOrNull('')).toBe(false);
    expect(AbstractValidator.isUndefinedOrNull(0)).toBe(false);
  });

  it('should check if props are empty', () => {
    expect(AbstractValidator.isEmptyProps(null)).toBe(false);
    expect(AbstractValidator.isEmptyProps(undefined)).toBe(false);
    expect(AbstractValidator.isEmptyProps({})).toBe(true);
    expect(AbstractValidator.isEmptyProps([])).toBe(true);
    expect(AbstractValidator.isEmptyProps('')).toBe(true);
    expect(AbstractValidator.isEmptyProps({ a: 1 })).toBe(false);
    expect(AbstractValidator.isEmptyProps([1])).toBe(false);
  });
});

describe('DomainValidator', () => {
  class TestEntity extends DomainEntity<{}> {
    protected businessRules(props: {}): void {}
  }

  it('should check if an object is an instance of DomainEntity', () => {
    const entity = new TestEntity({ id: '1' as any, props: {}, trackingProps: {} as any });
    expect(DomainValidator.isInstanceof(entity)).toBe(true);
    expect(DomainValidator.isInstanceof({})).toBe(false);
  });
});

describe('ValueObjectValidator', () => {
  class TestValueObject extends AbstractDomainValueObject<string> {
    protected businessRules(props: IDomainPrimitive<string>): void {}
  }

  it('should validate props', () => {
    const brokenRules = ValueObjectValidator.validate(null);
    expect(brokenRules.hasBrokenRules()).toBe(true);
  });

  it('should check if an object is an instance of a value object', () => {
    const vo = new TestValueObject({ value: 'test' });
    expect(ValueObjectValidator.isInstanceOf(vo)).toBe(true);
    expect(ValueObjectValidator.isInstanceOf('test')).toBe(false);
  });

  it('should check if an object is a value object', () => {
    const vo = new TestValueObject({ value: 'test' });
    expect(ValueObjectValidator.isValueObject(vo)).toBe(true);
    expect(ValueObjectValidator.isValueObject({})).toBe(false);
  });

  it('should check if an object is a domain primitive', () => {
    const primitive = { value: 'test' };
    expect(ValueObjectValidator.isDomainPrimitive(primitive)).toBe(true);
    expect(ValueObjectValidator.isDomainPrimitive({})).toBe(false);
  });
});
