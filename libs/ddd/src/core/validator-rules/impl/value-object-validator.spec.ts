import { StringValueObject } from '../../../valueobjects';
import { ValueObjectValidator } from './value-object-validator';

describe('ValueObjectValidator', () => {
  let validator: ValueObjectValidator;

  beforeEach(() => {
    validator = new ValueObjectValidator();
  });

  describe('validate', () => {
    it('debe retornar true para instancias de DddValueObject', () => {
      const valueObject = StringValueObject.create('test');

      expect(validator.validate(valueObject)).toBe(true);
    });

    it('debe retornar false para objetos que no son instancias de DddValueObject', () => {
      expect(validator.validate({})).toBe(false);
      expect(validator.validate('string')).toBe(false);
      expect(validator.validate(123)).toBe(false);
      expect(validator.validate(true)).toBe(false);
      expect(validator.validate(null)).toBe(false);
      expect(validator.validate(undefined)).toBe(false);
      expect(validator.validate([])).toBe(false);
    });

    it('debe retornar false para clases que no extienden DddValueObject', () => {
      class RegularClass {
        public value: string;
        constructor() {
          this.value = 'test';
        }
      }

      const instance = new RegularClass();

      expect(validator.validate(instance)).toBe(false);
    });

    it('debe retornar false para objetos planos', () => {
      const plainObject = {
        value: 'test',
      };

      expect(validator.validate(plainObject)).toBe(false);
    });

    it('debe retornar false para arrays', () => {
      expect(validator.validate([1, 2, 3])).toBe(false);
      expect(validator.validate([])).toBe(false);
    });

    it('debe retornar false para funciones', () => {
      expect(validator.validate(() => {})).toBe(false);
      expect(validator.validate(function () {})).toBe(false);
    });

    it('debe retornar false para Date', () => {
      expect(validator.validate(new Date())).toBe(false);
    });

    it('debe retornar true para instancias derivadas de DddValueObject', () => {
      const valueObject = StringValueObject.create('test');
      const anotherValueObject = StringValueObject.create('another');

      expect(validator.validate(valueObject)).toBe(true);
      expect(validator.validate(anotherValueObject)).toBe(true);
    });
  });

  describe('isValueObject (método estático)', () => {
    it('debe retornar true para instancias de DddValueObject', () => {
      const valueObject = StringValueObject.create('test');

      expect(ValueObjectValidator.isValueObject(valueObject)).toBe(true);
    });

    it('debe retornar false para objetos que no son instancias de DddValueObject', () => {
      expect(ValueObjectValidator.isValueObject({})).toBe(false);
      expect(ValueObjectValidator.isValueObject('string')).toBe(false);
      expect(ValueObjectValidator.isValueObject(123)).toBe(false);
      expect(ValueObjectValidator.isValueObject(true)).toBe(false);
      expect(ValueObjectValidator.isValueObject(null)).toBe(false);
      expect(ValueObjectValidator.isValueObject(undefined)).toBe(false);
      expect(ValueObjectValidator.isValueObject([])).toBe(false);
    });

    it('debe funcionar como type guard', () => {
      const valueObject = StringValueObject.create('test');
      const unknownValue: unknown = valueObject;

      if (ValueObjectValidator.isValueObject(unknownValue)) {
        // TypeScript debería reconocer que unknownValue es DddValueObject aquí
        expect(unknownValue.trackingState).toBeDefined();
        expect(unknownValue.validatorRules).toBeDefined();
        expect(unknownValue.brokenRules).toBeDefined();
      }
    });

    it('debe retornar false para clases que no extienden DddValueObject', () => {
      class RegularClass {
        public value: string;
        constructor() {
          this.value = 'test';
        }
      }

      const instance = new RegularClass();

      expect(ValueObjectValidator.isValueObject(instance)).toBe(false);
    });

    it('debe retornar true para instancias derivadas de DddValueObject', () => {
      const valueObject = StringValueObject.create('test');
      const anotherValueObject = StringValueObject.create('another');

      expect(ValueObjectValidator.isValueObject(valueObject)).toBe(true);
      expect(ValueObjectValidator.isValueObject(anotherValueObject)).toBe(true);
    });
  });
});
