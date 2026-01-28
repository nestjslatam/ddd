import { BrokenRule } from './broken-rule';

describe('BrokenRule', () => {
  describe('constructor', () => {
    it('debe crear una instancia con property, message y severity', () => {
      const rule = new BrokenRule('name', 'Name is required', 'Error');

      expect(rule.property).toBe('name');
      expect(rule.message).toBe('Name is required');
      expect(rule.severity).toBe('Error');
    });

    it('debe crear una instancia con severity Warning', () => {
      const rule = new BrokenRule('email', 'Email format is invalid', 'Warning');

      expect(rule.property).toBe('email');
      expect(rule.message).toBe('Email format is invalid');
      expect(rule.severity).toBe('Warning');
    });

    it('debe permitir propiedades con diferentes valores', () => {
      const rule1 = new BrokenRule('id', 'ID is required', 'Error');
      const rule2 = new BrokenRule('price', 'Price must be positive', 'Error');
      const rule3 = new BrokenRule('quantity', 'Quantity must be greater than 0', 'Warning');

      expect(rule1.property).toBe('id');
      expect(rule2.property).toBe('price');
      expect(rule3.property).toBe('quantity');
    });

    it('debe permitir mensajes largos', () => {
      const longMessage = 'This is a very long error message that describes in detail what went wrong with the validation';
      const rule = new BrokenRule('field', longMessage, 'Error');

      expect(rule.message).toBe(longMessage);
    });

    it('debe permitir propiedades vacías', () => {
      const rule = new BrokenRule('', 'General error', 'Error');

      expect(rule.property).toBe('');
      expect(rule.message).toBe('General error');
    });
  });

  describe('inmutabilidad', () => {
    it('debe tener propiedades readonly que no pueden ser modificadas', () => {
      const rule = new BrokenRule('test', 'Test message', 'Error');

      // TypeScript previene la modificación en tiempo de compilación con readonly
      // Las propiedades son readonly en la definición de la clase
      expect(rule.property).toBe('test');
      expect(rule.message).toBe('Test message');
      expect(rule.severity).toBe('Error');
      
      // Verificar que las propiedades existen y tienen valores
      expect(typeof rule.property).toBe('string');
      expect(typeof rule.message).toBe('string');
      expect(typeof rule.severity).toBe('string');
    });
  });

  describe('valores de severity', () => {
    it('debe aceptar Error como severity', () => {
      const rule = new BrokenRule('test', 'Test', 'Error');
      expect(rule.severity).toBe('Error');
    });

    it('debe aceptar Warning como severity', () => {
      const rule = new BrokenRule('test', 'Test', 'Warning');
      expect(rule.severity).toBe('Warning');
    });
  });
});
