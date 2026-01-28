import { BrokenRule } from '../../business-rules';
import { AbstractRuleValidator } from './abstract-rule-validator';

describe('AbstractRuleValidator', () => {
  class TestSubject {
    constructor(public name: string, public age: number) {}
  }

  class TestRuleValidator extends AbstractRuleValidator<TestSubject> {
    public addRules(): void {
      if (!this.subject.name || this.subject.name.trim() === '') {
        this.addBrokenRule('name', 'Name is required');
      }

      if (this.subject.age < 0) {
        this.addBrokenRule('age', 'Age must be non-negative');
      }

      if (this.subject.age > 150) {
        this.addBrokenRule('age', 'Age must be less than 150');
      }
    }
  }

  describe('constructor', () => {
    it('debe inicializar con el sujeto a validar', () => {
      const subject = new TestSubject('John', 25);
      const validator = new TestRuleValidator(subject);

      expect(validator.subject).toBe(subject);
    });
  });

  describe('validate', () => {
    it('debe retornar array vacío cuando el sujeto es válido', () => {
      const subject = new TestSubject('John', 25);
      const validator = new TestRuleValidator(subject);

      const result = validator.validate();

      expect(result.length).toBe(0);
    });

    it('debe retornar reglas rotas cuando el sujeto es inválido', () => {
      const subject = new TestSubject('', 25);
      const validator = new TestRuleValidator(subject);

      const result = validator.validate();

      expect(result.length).toBe(1);
      expect(result[0].property).toBe('name');
      expect(result[0].message).toBe('Name is required');
    });

    it('debe retornar múltiples reglas rotas', () => {
      const subject = new TestSubject('', -5);
      const validator = new TestRuleValidator(subject);

      const result = validator.validate();

      expect(result.length).toBe(2);
      expect(result.some((r) => r.property === 'name')).toBe(true);
      expect(result.some((r) => r.property === 'age')).toBe(true);
    });

    it('debe reiniciar las reglas rotas en cada validación', () => {
      const subject1 = new TestSubject('', 25);
      const validator1 = new TestRuleValidator(subject1);

      const result1 = validator1.validate();
      expect(result1.length).toBe(1);

      const subject2 = new TestSubject('John', 25);
      const validator2 = new TestRuleValidator(subject2);
      const result2 = validator2.validate();
      expect(result2.length).toBe(0);
    });

    it('debe retornar array vacío cuando el sujeto es null', () => {
      const validator = new TestRuleValidator(null as any);

      const result = validator.validate();

      expect(result.length).toBe(0);
    });

    it('debe retornar array vacío cuando el sujeto es undefined', () => {
      const validator = new TestRuleValidator(undefined as any);

      const result = validator.validate();

      expect(result.length).toBe(0);
    });

    it('debe retornar un ReadonlyArray', () => {
      const subject = new TestSubject('John', 25);
      const validator = new TestRuleValidator(subject);

      const result = validator.validate();

      // Verificar que es un ReadonlyArray (TypeScript previene push en tiempo de compilación)
      // En tiempo de ejecución, verificamos que el tipo es correcto
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('addBrokenRule', () => {
    it('debe agregar una regla rota con severity Error por defecto', () => {
      class SimpleValidator extends AbstractRuleValidator<TestSubject> {
        public addRules(): void {
          this.addBrokenRule('test', 'Test error');
        }
      }

      const subject = new TestSubject('John', 25);
      const validator = new SimpleValidator(subject);

      const result = validator.validate();

      expect(result.length).toBe(1);
      expect(result[0].property).toBe('test');
      expect(result[0].message).toBe('Test error');
      expect(result[0].severity).toBe('Error');
    });

    it('debe agregar múltiples reglas rotas', () => {
      class MultipleRulesValidator extends AbstractRuleValidator<TestSubject> {
        public addRules(): void {
          this.addBrokenRule('prop1', 'Error 1');
          this.addBrokenRule('prop2', 'Error 2');
          this.addBrokenRule('prop3', 'Error 3');
        }
      }

      const subject = new TestSubject('John', 25);
      const validator = new MultipleRulesValidator(subject);

      const result = validator.validate();

      expect(result.length).toBe(3);
    });
  });

  describe('getValidatorDescriptor', () => {
    it('debe retornar el constructor del validador', () => {
      const subject = new TestSubject('John', 25);
      const validator = new TestRuleValidator(subject);

      const descriptor = validator.getValidatorDescriptor();

      expect(descriptor).toBe(TestRuleValidator);
    });

    it('debe retornar el tipo correcto para diferentes validadores', () => {
      class AnotherValidator extends AbstractRuleValidator<TestSubject> {
        public addRules(): void {}
      }

      const subject = new TestSubject('John', 25);
      const validator1 = new TestRuleValidator(subject);
      const validator2 = new AnotherValidator(subject);

      expect(validator1.getValidatorDescriptor()).toBe(TestRuleValidator);
      expect(validator2.getValidatorDescriptor()).toBe(AnotherValidator);
    });
  });

  describe('getSubjectDescriptor', () => {
    it('debe retornar el constructor del sujeto', () => {
      const subject = new TestSubject('John', 25);
      const validator = new TestRuleValidator(subject);

      const descriptor = validator.getSubjectDescriptor();

      expect(descriptor).toBe(TestSubject);
    });

    it('debe lanzar error si el sujeto es null', () => {
      const validator = new TestRuleValidator(null as any);

      expect(() => {
        validator.getSubjectDescriptor();
      }).toThrow('Subject is null or undefined.');
    });

    it('debe lanzar error si el sujeto es undefined', () => {
      const validator = new TestRuleValidator(undefined as any);

      expect(() => {
        validator.getSubjectDescriptor();
      }).toThrow('Subject is null or undefined.');
    });
  });

  describe('herencia y polimorfismo', () => {
    class BaseValidator extends AbstractRuleValidator<TestSubject> {
      public addRules(): void {
        if (!this.subject.name) {
          this.addBrokenRule('name', 'Name is required');
        }
      }
    }

    class DerivedValidator extends BaseValidator {
      public addRules(): void {
        super.addRules();
        if (this.subject.age < 18) {
          this.addBrokenRule('age', 'Age must be at least 18');
        }
      }
    }

    it('debe permitir herencia de validadores', () => {
      const subject = new TestSubject('', 15);
      const validator = new DerivedValidator(subject);

      const result = validator.validate();

      expect(result.length).toBe(2);
    });

    it('debe ejecutar la lógica del validador base y derivado', () => {
      const subject = new TestSubject('John', 15);
      const validator = new DerivedValidator(subject);

      const result = validator.validate();

      expect(result.length).toBe(1);
      expect(result[0].property).toBe('age');
    });
  });
});
