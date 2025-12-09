
import { jest } from '@jest/globals';
import { DateTimeHelper } from './datetime.helper';
import { DomainObjectHelper } from './domain-object.helper';
import { DomainEntity, AbstractDomainValueObject, IDomainPrimitive } from '../ddd-core/ddd-base-classes';

describe('DateTimeHelper', () => {
  it('should return a UTC date', () => {
    const date = DateTimeHelper.getUtcDate();
    expect(date.getUTCHours()).toBe(0);
    expect(date.getUTCMinutes()).toBe(0);
    expect(date.getUTCSeconds()).toBe(0);
    expect(date.getUTCMilliseconds()).toBe(0);
  });

  it('should return a timestamp', () => {
    const timestamp = DateTimeHelper.getTimeStamp();
    expect(typeof timestamp).toBe('number');
  });
});

describe('DomainObjectHelper', () => {
  class TestEntity extends DomainEntity<{}> {
    protected businessRules(props: {}): void {}
  }

  class TestValueObject extends AbstractDomainValueObject<string> {
    protected businessRules(props: IDomainPrimitive<string>): void {}
  }

  it('should identify an entity', () => {
    const entity = new TestEntity({ id: '1' as any, props: {}, trackingProps: {} as any });
    expect(DomainObjectHelper.isDomainEntity(entity)).toBe(true);
    expect(DomainObjectHelper.isEntity(entity)).toBe(true);
  });

  it('should convert props to a plain object', () => {
    const props = {
      a: new TestValueObject({ value: 'test' }),
      b: [new TestValueObject({ value: 'test2' })],
      c: 'string',
    };
    const plain = DomainObjectHelper.convertPropsToObject(props);
    expect(plain.a).toBe('test');
    expect(plain.b[0]).toBe('test2');
    expect(plain.c).toBe('string');
  });

  it('should get event name from an event', () => {
    class MyEvent {}
    const event = new MyEvent();
    expect(DomainObjectHelper.getEventName(event)).toBe('MyEvent');
  });
});
