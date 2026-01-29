import { AggregateSerializer } from './aggregate-serializer';
import { IdValueObject } from '../../valueobjects';
import { TrackingStateManager } from '../../tracking-state-manager';
import { BrokenRulesManager } from '../../broken-rules.manager';

interface TestProps {
  name: string;
  age: number;
}

describe('AggregateSerializer', () => {
  let id: IdValueObject;
  let props: TestProps;
  let trackingState: TrackingStateManager;
  let isValidFn: jest.Mock;
  let version: number;

  beforeEach(() => {
    id = IdValueObject.create();
    props = { name: 'Test', age: 25 };
    trackingState = new TrackingStateManager();
    isValidFn = jest.fn().mockReturnValue(true);
    version = 1;
  });

  describe('constructor', () => {
    it('should create a serializer with all dependencies', () => {
      const serializer = new AggregateSerializer(
        id,
        props,
        version,
        trackingState,
        isValidFn,
      );

      expect(serializer).toBeInstanceOf(AggregateSerializer);
    });
  });

  describe('toPlainObject', () => {
    it('should return a plain object with id, version, props, and isValid', () => {
      const serializer = new AggregateSerializer(
        id,
        props,
        version,
        trackingState,
        isValidFn,
      );

      const result = serializer.toPlainObject();

      expect(result).toEqual({
        id,
        version,
        name: 'Test',
        age: 25,
        isValid: true,
      });
    });

    it('should call isValidFn to determine validation status', () => {
      const serializer = new AggregateSerializer(
        id,
        props,
        version,
        trackingState,
        isValidFn,
      );

      serializer.toPlainObject();

      expect(isValidFn).toHaveBeenCalled();
    });

    it('should include validation status in result', () => {
      isValidFn.mockReturnValue(false);

      const serializer = new AggregateSerializer(
        id,
        props,
        version,
        trackingState,
        isValidFn,
      );

      const result = serializer.toPlainObject();

      expect(result.isValid).toBe(false);
    });

    it('should spread props into the result', () => {
      const richProps = {
        name: 'Test',
        age: 25,
        email: 'test@example.com',
        active: true,
      };

      const serializer = new AggregateSerializer(
        id,
        richProps,
        version,
        trackingState,
        isValidFn,
      );

      const result = serializer.toPlainObject();

      expect(result).toMatchObject(richProps);
      expect(result.id).toBe(id);
      expect(result.version).toBe(version);
    });

    it('should not include tracking state manager', () => {
      const serializer = new AggregateSerializer(
        id,
        props,
        version,
        trackingState,
        isValidFn,
      );

      const result = serializer.toPlainObject();

      expect(result).not.toHaveProperty('trackingState');
    });
  });

  describe('toFullObject', () => {
    it('should return object with managers included', () => {
      const brokenRules = new BrokenRulesManager();
      const serializer = new AggregateSerializer(
        id,
        props,
        version,
        trackingState,
        isValidFn,
      );

      const result = serializer.toFullObject(brokenRules);

      expect(result).toHaveProperty('id', id);
      expect(result).toHaveProperty('trackingState', trackingState);
      expect(result).toHaveProperty('brokenRules', brokenRules);
      expect(result).toHaveProperty('isValid', true);
      expect(result).toHaveProperty('name', 'Test');
      expect(result).toHaveProperty('age', 25);
    });

    it('should include all props', () => {
      const brokenRules = new BrokenRulesManager();
      const serializer = new AggregateSerializer(
        id,
        props,
        version,
        trackingState,
        isValidFn,
      );

      const result = serializer.toFullObject(brokenRules);

      expect(result.name).toBe('Test');
      expect(result.age).toBe(25);
    });

    it('should call isValidFn to determine validation status', () => {
      const brokenRules = new BrokenRulesManager();
      const serializer = new AggregateSerializer(
        id,
        props,
        version,
        trackingState,
        isValidFn,
      );

      serializer.toFullObject(brokenRules);

      expect(isValidFn).toHaveBeenCalled();
    });
  });

  describe('getFrozenCopy', () => {
    it('should return a frozen object', () => {
      const serializer = new AggregateSerializer(
        id,
        props,
        version,
        trackingState,
        isValidFn,
      );

      const result = serializer.getFrozenCopy();

      expect(Object.isFrozen(result)).toBe(true);
    });

    it('should include id, props, and trackingState', () => {
      const serializer = new AggregateSerializer(
        id,
        props,
        version,
        trackingState,
        isValidFn,
      );

      const result = serializer.getFrozenCopy();

      expect(result.id).toBe(id);
      expect(result.props).toBe(props);
      expect(result.trackingState).toBeDefined();
    });

    it('should include trackingProps from tracking state', () => {
      trackingState.markAsNew();
      const serializer = new AggregateSerializer(
        id,
        props,
        version,
        trackingState,
        isValidFn,
      );

      const result = serializer.getFrozenCopy();

      expect(result.trackingState).toEqual(trackingState.trackingProps);
    });

    it('should prevent modification of the returned object', () => {
      const serializer = new AggregateSerializer(
        id,
        props,
        version,
        trackingState,
        isValidFn,
      );

      const result = serializer.getFrozenCopy();

      expect(() => {
        (result as any).newProperty = 'value';
      }).toThrow();
    });

    it('should create a new frozen object each time', () => {
      const serializer = new AggregateSerializer(
        id,
        props,
        version,
        trackingState,
        isValidFn,
      );

      const result1 = serializer.getFrozenCopy();
      const result2 = serializer.getFrozenCopy();

      // Different instances but same content
      expect(result1).not.toBe(result2);
      expect(result1.id).toBe(result2.id);
      expect(result1.props).toBe(result2.props);
    });
  });
});
