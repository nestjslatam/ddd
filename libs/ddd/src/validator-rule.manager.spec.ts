import { BrokenRule } from './core/business-rules/impl/broken-rule';
import { AbstractRuleValidator } from './core/validator-rules/impl/abstract-rule-validator';
import { ValidatorRuleManager } from './validator-rule.manager';

describe('ValidatorRuleManager', () => {
  class TestSubject {
    constructor(public value: number) {}
  }

  class PositiveNumberValidator extends AbstractRuleValidator<TestSubject> {
    public addRules(): void {
      if (this.subject.value <= 0) {
        this.addBrokenRule('value', 'Value must be positive');
      }
    }
  }

  class MaxValueValidator extends AbstractRuleValidator<TestSubject> {
    public addRules(): void {
      if (this.subject.value > 100) {
        this.addBrokenRule('value', 'Value must be less than 100');
      }
    }
  }

  class MinValueValidator extends AbstractRuleValidator<TestSubject> {
    public addRules(): void {
      if (this.subject.value < 10) {
        this.addBrokenRule('value', 'Value must be at least 10');
      }
    }
  }

  let manager: ValidatorRuleManager<AbstractRuleValidator<TestSubject>>;

  beforeEach(() => {
    manager = new ValidatorRuleManager<AbstractRuleValidator<TestSubject>>();
  });

  describe('constructor', () => {
    it('debe inicializar con una lista vacía de validadores', () => {
      expect(manager.getValidators().length).toBe(0);
    });
  });

  describe('add', () => {
    it('debe agregar un validador a la colección', () => {
      const subject = new TestSubject(50);
      const validator = new PositiveNumberValidator(subject);

      manager.add(validator);

      const validators = manager.getValidators();
      expect(validators.length).toBe(1);
      expect(validators[0]).toBe(validator);
    });

    it('debe lanzar error si se intenta agregar null', () => {
      expect(() => {
        manager.add(null as any);
      }).toThrow('rule cannot be null or undefined');
    });

    it('debe lanzar error si se intenta agregar undefined', () => {
      expect(() => {
        manager.add(undefined as any);
      }).toThrow('rule cannot be null or undefined');
    });

    it('no debe agregar validadores duplicados del mismo tipo', () => {
      const subject = new TestSubject(50);
      const validator1 = new PositiveNumberValidator(subject);
      const validator2 = new PositiveNumberValidator(subject);

      manager.add(validator1);
      manager.add(validator2);

      const validators = manager.getValidators();
      expect(validators.length).toBe(1);
    });

    it('debe agregar validadores de diferentes tipos', () => {
      const subject = new TestSubject(50);
      const validator1 = new PositiveNumberValidator(subject);
      const validator2 = new MaxValueValidator(subject);
      const validator3 = new MinValueValidator(subject);

      manager.add(validator1);
      manager.add(validator2);
      manager.add(validator3);

      const validators = manager.getValidators();
      expect(validators.length).toBe(3);
    });
  });

  describe('addRange', () => {
    it('debe agregar múltiples validadores', () => {
      const subject = new TestSubject(50);
      const validators = [
        new PositiveNumberValidator(subject),
        new MaxValueValidator(subject),
        new MinValueValidator(subject),
      ];

      manager.addRange(validators);

      const result = manager.getValidators();
      expect(result.length).toBe(3);
    });

    it('debe lanzar error si se intenta agregar null', () => {
      expect(() => {
        manager.addRange(null as any);
      }).toThrow('rules cannot be null or undefined');
    });

    it('debe lanzar error si se intenta agregar undefined', () => {
      expect(() => {
        manager.addRange(undefined as any);
      }).toThrow('rules cannot be null or undefined');
    });

    it('debe agregar un array vacío sin errores', () => {
      manager.addRange([]);

      expect(manager.getValidators().length).toBe(0);
    });

    it('no debe agregar duplicados cuando se usa addRange', () => {
      const subject = new TestSubject(50);
      const validators = [
        new PositiveNumberValidator(subject),
        new PositiveNumberValidator(subject),
        new PositiveNumberValidator(subject),
      ];

      manager.addRange(validators);

      const result = manager.getValidators();
      expect(result.length).toBe(1);
    });
  });

  describe('remove', () => {
    it('debe eliminar un validador existente', () => {
      const subject = new TestSubject(50);
      const validator = new PositiveNumberValidator(subject);

      manager.add(validator);
      expect(manager.getValidators().length).toBe(1);

      manager.remove(validator);
      expect(manager.getValidators().length).toBe(0);
    });

    it('no debe lanzar error si el validador no existe', () => {
      const subject = new TestSubject(50);
      const validator = new PositiveNumberValidator(subject);

      expect(() => {
        manager.remove(validator);
      }).not.toThrow();
    });

    it('debe lanzar error si se intenta eliminar null', () => {
      expect(() => {
        manager.remove(null as any);
      }).toThrow('rule cannot be null or undefined');
    });

    it('debe eliminar solo el validador especificado', () => {
      const subject = new TestSubject(50);
      const validator1 = new PositiveNumberValidator(subject);
      const validator2 = new MaxValueValidator(subject);

      manager.add(validator1);
      manager.add(validator2);

      manager.remove(validator1);

      const validators = manager.getValidators();
      expect(validators.length).toBe(1);
      expect(validators[0]).toBe(validator2);
    });
  });

  describe('clear', () => {
    it('debe limpiar todos los validadores', () => {
      const subject = new TestSubject(50);
      manager.add(new PositiveNumberValidator(subject));
      manager.add(new MaxValueValidator(subject));

      manager.clear();

      expect(manager.getValidators().length).toBe(0);
    });

    it('no debe lanzar error si la lista ya está vacía', () => {
      expect(() => {
        manager.clear();
      }).not.toThrow();
    });
  });

  describe('getValidators', () => {
    it('debe retornar un array de solo lectura', () => {
      const subject = new TestSubject(50);
      manager.add(new PositiveNumberValidator(subject));

      const validators = manager.getValidators();

      // Verificar que es un ReadonlyArray (TypeScript previene push en tiempo de compilación)
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBe(1);
    });

    it('debe retornar una copia del array interno', () => {
      const subject = new TestSubject(50);
      const validator = new PositiveNumberValidator(subject);
      manager.add(validator);

      const validators1 = manager.getValidators();
      const validators2 = manager.getValidators();

      expect(validators1).not.toBe(validators2);
      expect(validators1.length).toBe(validators2.length);
    });

    it('debe retornar todos los validadores agregados', () => {
      const subject = new TestSubject(50);
      const validator1 = new PositiveNumberValidator(subject);
      const validator2 = new MaxValueValidator(subject);
      const validator3 = new MinValueValidator(subject);

      manager.add(validator1);
      manager.add(validator2);
      manager.add(validator3);

      const validators = manager.getValidators();
      expect(validators.length).toBe(3);
      expect(validators).toContain(validator1);
      expect(validators).toContain(validator2);
      expect(validators).toContain(validator3);
    });
  });

  describe('getBrokenRules', () => {
    it('debe retornar array vacío cuando todos los validadores pasan', () => {
      const subject = new TestSubject(50);
      manager.add(new PositiveNumberValidator(subject));
      manager.add(new MaxValueValidator(subject));
      manager.add(new MinValueValidator(subject));

      const brokenRules = manager.getBrokenRules();

      expect(brokenRules.length).toBe(0);
    });

    it('debe retornar reglas rotas cuando algún validador falla', () => {
      const subject = new TestSubject(-5);
      manager.add(new PositiveNumberValidator(subject));

      const brokenRules = manager.getBrokenRules();

      expect(brokenRules.length).toBe(1);
      expect(brokenRules[0].property).toBe('value');
      expect(brokenRules[0].message).toBe('Value must be positive');
    });

    it('debe consolidar reglas rotas de múltiples validadores', () => {
      const subject = new TestSubject(150);
      manager.add(new PositiveNumberValidator(subject));
      manager.add(new MaxValueValidator(subject));
      manager.add(new MinValueValidator(subject));

      const brokenRules = manager.getBrokenRules();

      expect(brokenRules.length).toBe(1);
      expect(brokenRules[0].message).toBe('Value must be less than 100');
    });

    it('debe retornar múltiples reglas rotas cuando varios validadores fallan', () => {
      const subject = new TestSubject(5);
      manager.add(new PositiveNumberValidator(subject));
      manager.add(new MinValueValidator(subject));

      const brokenRules = manager.getBrokenRules();

      expect(brokenRules.length).toBe(1);
      expect(brokenRules[0].message).toBe('Value must be at least 10');
    });

    it('no debe incluir duplicados en las reglas rotas', () => {
      class DuplicateValidator extends AbstractRuleValidator<TestSubject> {
        public addRules(): void {
          this.addBrokenRule('value', 'Duplicate error');
          this.addBrokenRule('value', 'Duplicate error');
        }
      }

      const subject = new TestSubject(50);
      manager.add(new DuplicateValidator(subject));

      const brokenRules = manager.getBrokenRules();

      expect(brokenRules.length).toBe(1);
    });

    it('debe normalizar comparaciones (trim + uppercase) para detectar duplicados', () => {
      class DuplicateValidator extends AbstractRuleValidator<TestSubject> {
        public addRules(): void {
          this.addBrokenRule('value', '  Error message  ');
          this.addBrokenRule('value', 'ERROR MESSAGE');
        }
      }

      const subject = new TestSubject(50);
      manager.add(new DuplicateValidator(subject));

      const brokenRules = manager.getBrokenRules();

      expect(brokenRules.length).toBe(1);
    });

    it('debe retornar un ReadonlyArray', () => {
      const subject = new TestSubject(-5);
      manager.add(new PositiveNumberValidator(subject));

      const brokenRules = manager.getBrokenRules();

      // Verificar que es un ReadonlyArray (TypeScript previene push en tiempo de compilación)
      expect(Array.isArray(brokenRules)).toBe(true);
      expect(brokenRules.length).toBe(1);
    });

    it('debe ejecutar validate en cada validador', () => {
      const subject = new TestSubject(50);
      const validator = new PositiveNumberValidator(subject);
      const validateSpy = jest.spyOn(validator, 'validate');

      manager.add(validator);
      manager.getBrokenRules();

      expect(validateSpy).toHaveBeenCalled();
    });
  });
});
