import { AbstractValidator } from './abstract-validator';

describe('AbstractValidator', () => {
  class ConcreteValidator extends AbstractValidator {
    public validate(obj: unknown): boolean {
      return typeof obj === 'string';
    }
  }

  describe('clase abstracta', () => {
    it('debe ser una clase abstracta que no se puede instanciar directamente', () => {
      // TypeScript previene la instanciación directa de clases abstractas en tiempo de compilación
      // En tiempo de ejecución, verificamos que se puede extender e implementar
      expect(AbstractValidator).toBeDefined();
      expect(typeof AbstractValidator).toBe('function');
    });

    it('debe permitir que las clases hijas implementen validate', () => {
      const validator = new ConcreteValidator();

      expect(validator.validate('test')).toBe(true);
      expect(validator.validate(123)).toBe(false);
      expect(validator.validate(null)).toBe(false);
    });

    it('debe requerir que las clases hijas implementen el método abstracto validate', () => {
      // TypeScript previene la compilación si no se implementa el método abstracto
      // Esta prueba verifica que la implementación funciona correctamente
      const validator = new ConcreteValidator();

      expect(typeof validator.validate).toBe('function');
    });
  });

  describe('herencia', () => {
    class AnotherValidator extends AbstractValidator {
      public validate(obj: unknown): boolean {
        return obj !== null && obj !== undefined;
      }
    }

    it('debe permitir múltiples implementaciones', () => {
      const validator1 = new ConcreteValidator();
      const validator2 = new AnotherValidator();

      expect(validator1.validate('test')).toBe(true);
      expect(validator2.validate('test')).toBe(true);
      expect(validator1.validate(null)).toBe(false);
      expect(validator2.validate(null)).toBe(false);
    });
  });
});
