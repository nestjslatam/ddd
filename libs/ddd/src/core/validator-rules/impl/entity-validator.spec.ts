// Mock del módulo aggregate-root antes de importar entity-validator
// para evitar dependencias circulares
jest.mock('../../../aggregate-root', () => {
  // Retornamos una clase mock que puede ser usada con instanceof
  class MockDddAggregateRoot<TEntity = any, TProps = any> {
    public Id: any;
    constructor(props: TProps) {
      // Constructor mock
    }
    protected Guard(): void {}
    protected AddValidators(): void {}
    protected addValidators(): void {}
  }
  return {
    DddAggregateRoot: MockDddAggregateRoot,
  };
});

import { EntityValidator } from './entity-validator';
import { DddAggregateRoot } from '../../../aggregate-root';
import { IdValueObject } from '../../../valueobjects';

describe('EntityValidator', () => {
  let validator: EntityValidator;

  beforeEach(() => {
    validator = new EntityValidator();
  });

  describe('validate', () => {
    it('debe retornar true para instancias de DddAggregateRoot', () => {
      class TestEntity extends DddAggregateRoot<any, any> {
        constructor() {
          super({}, { skipInitialValidation: true });
        }
      }

      const entity = new TestEntity();

      expect(validator.validate(entity)).toBe(true);
    });

    it('debe retornar false para objetos que no son instancias de DddAggregateRoot', () => {
      expect(validator.validate({})).toBe(false);
      expect(validator.validate('string')).toBe(false);
      expect(validator.validate(123)).toBe(false);
      expect(validator.validate(true)).toBe(false);
      expect(validator.validate(null)).toBe(false);
      expect(validator.validate(undefined)).toBe(false);
      expect(validator.validate([])).toBe(false);
    });

    it('debe retornar false para clases que no extienden DddAggregateRoot', () => {
      class RegularClass {
        public name: string;
        constructor() {
          this.name = 'test';
        }
      }

      const instance = new RegularClass();

      expect(validator.validate(instance)).toBe(false);
    });

    it('debe retornar false para objetos planos', () => {
      const plainObject = {
        id: '123',
        name: 'test',
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

    it('debe retornar true para instancias derivadas de DddAggregateRoot', () => {
      class TestEntity extends DddAggregateRoot<any, any> {
        constructor() {
          super({}, { skipInitialValidation: true });
        }
      }

      class DerivedEntity extends TestEntity {}

      const entity = new TestEntity();
      const derivedEntity = new DerivedEntity();

      expect(validator.validate(entity)).toBe(true);
      expect(validator.validate(derivedEntity)).toBe(true);
    });
  });
});
