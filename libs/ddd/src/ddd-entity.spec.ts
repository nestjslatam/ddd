
import { DomainEntity, IDomainEntityProps } from './ddd-core/ddd-base-classes';
import { DomainUid } from './ddd-valueobjects';
import { TrackingProps, ITrackingProps } from './ddd-core';
import * as crypto from 'crypto';

// Mock concrete implementation of DomainEntity for testing
class TestEntity extends DomainEntity<{ prop1: string }> {
  protected businessRules(props: { prop1: string }): void {
    // No business rules for this test
  }
}

describe('DomainEntity', () => {
  let trackingProps: ITrackingProps;

  beforeEach(() => {
    trackingProps = TrackingProps.setNew();
  });

  const createTestEntity = (id?: DomainUid, props?: { prop1: string }) => {
    const entityProps: IDomainEntityProps<{ prop1: string }> = {
      id: id || DomainUid.create(crypto.randomUUID()),
      props: props || { prop1: 'test' },
      trackingProps,
    };
    return new TestEntity(entityProps);
  };

  it('should be defined', () => {
    expect(createTestEntity()).toBeDefined();
  });

  it('should have an id', () => {
    const entity = createTestEntity();
    expect(entity.id).toBeDefined();
  });

  it('should have props', () => {
    const entity = createTestEntity();
    expect(entity.props).toBeDefined();
  });

  it('should have tracking props', () => {
    const entity = createTestEntity();
    expect(entity.trackingProps).toBeDefined();
  });

  it('should be valid by default', () => {
    const entity = createTestEntity();
    expect(entity.IsValid).toBe(true);
  });

  describe('equals', () => {
    it('should return true for the same entity instance', () => {
      const entity = createTestEntity();
      expect(entity['equals'](entity)).toBe(true);
    });

    it('should return true for different instances with the same id', () => {
      const id = DomainUid.create(crypto.randomUUID());
      const entity1 = createTestEntity(id);
      const entity2 = createTestEntity(id);
      expect(entity1['equals'](entity2)).toBe(true);
    });

    it('should return false for entities with different ids', () => {
      const entity1 = createTestEntity();
      const entity2 = createTestEntity();
      expect(entity1['equals'](entity2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const entity = createTestEntity();
      expect(entity['equals'](null as any)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      const entity = createTestEntity();
      expect(entity['equals'](undefined as any)).toBe(false);
    });

    it('should return false when comparing with a non-entity object', () => {
      const entity = createTestEntity();
      expect(entity['equals']({} as any)).toBe(false);
    });
  });

  describe('addChild and removeChild', () => {
    class ChildEntity extends DomainEntity<{ childProp: string }> {
      protected businessRules(props: { childProp: string }): void {}
    }

    const createChildEntity = (id?: DomainUid) => {
      const entityProps: IDomainEntityProps<{ childProp: string }> = {
        id: id || DomainUid.create(crypto.randomUUID()),
        props: { childProp: 'child' },
        trackingProps: TrackingProps.setNew(),
      };
      return new ChildEntity(entityProps);
    };

    it('should add a child to a collection', () => {
      const parent = createTestEntity();
      const child = createChildEntity();
      let children: ChildEntity[] = [];
      children = parent.addChild(parent, child, children);
      expect(children).toHaveLength(1);
      expect(children[0]).toBe(child);
    });

    it('should not add a duplicate child', () => {
      const parent = createTestEntity();
      const child = createChildEntity();
      let children: ChildEntity[] = [child];
      children = parent.addChild(parent, child, children);
      expect(children).toHaveLength(1);
      expect(parent.BrokenRules.getItems()).toHaveLength(1);
    });

    it('should remove a child from a collection', () => {
      const parent = createTestEntity();
      const child = createChildEntity();
      let children: ChildEntity[] = [child];
      children = parent.removeChild(parent, child, children);
      expect(children).toHaveLength(0);
    });

    it('should not fail when removing a non-existent child', () => {
      const parent = createTestEntity();
      const child1 = createChildEntity();
      const child2 = createChildEntity();
      let children: ChildEntity[] = [child1];
      children = parent.removeChild(parent, child2, children);
      expect(children).toHaveLength(1);
      expect(parent.BrokenRules.getItems()).toHaveLength(1);
    });
  });
});
