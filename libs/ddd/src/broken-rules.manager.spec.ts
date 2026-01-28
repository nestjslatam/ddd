import { BrokenRule } from './core/business-rules/impl/broken-rule';
import { BrokenRulesManager } from './broken-rules.manager';

describe('BrokenRulesManager', () => {
  let manager: BrokenRulesManager;

  beforeEach(() => {
    manager = new BrokenRulesManager();
  });

  describe('constructor', () => {
    it('debe inicializar con una lista vacía de reglas rotas', () => {
      expect(manager.getBrokenRules().length).toBe(0);
    });
  });

  describe('add', () => {
    it('debe agregar una regla rota', () => {
      const rule = new BrokenRule('name', 'Name is required', 'Error');

      manager.add(rule);

      const rules = manager.getBrokenRules();
      expect(rules.length).toBe(1);
      expect(rules[0]).toBe(rule);
    });

    it('debe lanzar error si se intenta agregar null', () => {
      expect(() => {
        manager.add(null as any);
      }).toThrow('brokenRule cannot be null or undefined');
    });

    it('debe lanzar error si se intenta agregar undefined', () => {
      expect(() => {
        manager.add(undefined as any);
      }).toThrow('brokenRule cannot be null or undefined');
    });

    it('no debe agregar reglas duplicadas (comparación insensible a mayúsculas)', () => {
      const rule1 = new BrokenRule('name', 'Name is required', 'Error');
      const rule2 = new BrokenRule('NAME', 'Name is required', 'Error');
      const rule3 = new BrokenRule('name', 'NAME IS REQUIRED', 'Error');

      manager.add(rule1);
      manager.add(rule2);
      manager.add(rule3);

      const rules = manager.getBrokenRules();
      expect(rules.length).toBe(1);
    });

    it('debe agregar reglas diferentes aunque tengan la misma propiedad', () => {
      const rule1 = new BrokenRule('name', 'Name is required', 'Error');
      const rule2 = new BrokenRule(
        'name',
        'Name must be at least 3 characters',
        'Error',
      );

      manager.add(rule1);
      manager.add(rule2);

      const rules = manager.getBrokenRules();
      expect(rules.length).toBe(2);
    });

    it('debe agregar reglas diferentes aunque tengan el mismo mensaje', () => {
      const rule1 = new BrokenRule('name', 'Invalid value', 'Error');
      const rule2 = new BrokenRule('email', 'Invalid value', 'Error');

      manager.add(rule1);
      manager.add(rule2);

      const rules = manager.getBrokenRules();
      expect(rules.length).toBe(2);
    });

    it('debe agregar múltiples reglas diferentes', () => {
      const rule1 = new BrokenRule('name', 'Name is required', 'Error');
      const rule2 = new BrokenRule('email', 'Email is invalid', 'Error');
      const rule3 = new BrokenRule('age', 'Age must be positive', 'Warning');

      manager.add(rule1);
      manager.add(rule2);
      manager.add(rule3);

      const rules = manager.getBrokenRules();
      expect(rules.length).toBe(3);
    });
  });

  describe('addRange', () => {
    it('debe agregar múltiples reglas rotas', () => {
      const rules = [
        new BrokenRule('name', 'Name is required', 'Error'),
        new BrokenRule('email', 'Email is invalid', 'Error'),
        new BrokenRule('age', 'Age must be positive', 'Warning'),
      ];

      manager.addRange(rules);

      const result = manager.getBrokenRules();
      expect(result.length).toBe(3);
    });

    it('debe lanzar error si se intenta agregar null', () => {
      expect(() => {
        manager.addRange(null as any);
      }).toThrow('brokenRules cannot be null or undefined');
    });

    it('debe lanzar error si se intenta agregar undefined', () => {
      expect(() => {
        manager.addRange(undefined as any);
      }).toThrow('brokenRules cannot be null or undefined');
    });

    it('debe agregar un array vacío sin errores', () => {
      manager.addRange([]);

      expect(manager.getBrokenRules().length).toBe(0);
    });

    it('no debe agregar duplicados cuando se usa addRange', () => {
      const rules = [
        new BrokenRule('name', 'Name is required', 'Error'),
        new BrokenRule('NAME', 'Name is required', 'Error'),
        new BrokenRule('name', 'NAME IS REQUIRED', 'Error'),
      ];

      manager.addRange(rules);

      const result = manager.getBrokenRules();
      expect(result.length).toBe(1);
    });
  });

  describe('remove', () => {
    it('debe eliminar una regla rota existente', () => {
      const rule = new BrokenRule('name', 'Name is required', 'Error');

      manager.add(rule);
      expect(manager.getBrokenRules().length).toBe(1);

      manager.remove(rule);
      expect(manager.getBrokenRules().length).toBe(0);
    });

    it('no debe lanzar error si la regla no existe', () => {
      const rule = new BrokenRule('name', 'Name is required', 'Error');

      expect(() => {
        manager.remove(rule);
      }).not.toThrow();
    });

    it('debe lanzar error si se intenta eliminar null', () => {
      expect(() => {
        manager.remove(null as any);
      }).toThrow('brokenRule cannot be null or undefined');
    });

    it('debe eliminar solo la regla especificada', () => {
      const rule1 = new BrokenRule('name', 'Name is required', 'Error');
      const rule2 = new BrokenRule('email', 'Email is invalid', 'Error');

      manager.add(rule1);
      manager.add(rule2);

      manager.remove(rule1);

      const rules = manager.getBrokenRules();
      expect(rules.length).toBe(1);
      expect(rules[0]).toBe(rule2);
    });
  });

  describe('clear', () => {
    it('debe limpiar todas las reglas rotas', () => {
      manager.add(new BrokenRule('name', 'Name is required', 'Error'));
      manager.add(new BrokenRule('email', 'Email is invalid', 'Error'));

      manager.clear();

      expect(manager.getBrokenRules().length).toBe(0);
    });

    it('no debe lanzar error si la lista ya está vacía', () => {
      expect(() => {
        manager.clear();
      }).not.toThrow();
    });
  });

  describe('getBrokenRules', () => {
    it('debe retornar un array de solo lectura', () => {
      manager.add(new BrokenRule('name', 'Name is required', 'Error'));

      const rules = manager.getBrokenRules();

      // Verificar que es un ReadonlyArray (TypeScript previene push en tiempo de compilación)
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBe(1);
    });

    it('debe retornar una copia del array interno', () => {
      const rule = new BrokenRule('name', 'Name is required', 'Error');
      manager.add(rule);

      const rules1 = manager.getBrokenRules();
      const rules2 = manager.getBrokenRules();

      expect(rules1).not.toBe(rules2);
      expect(rules1.length).toBe(rules2.length);
    });

    it('debe retornar todas las reglas agregadas', () => {
      const rule1 = new BrokenRule('name', 'Name is required', 'Error');
      const rule2 = new BrokenRule('email', 'Email is invalid', 'Error');
      const rule3 = new BrokenRule('age', 'Age must be positive', 'Warning');

      manager.add(rule1);
      manager.add(rule2);
      manager.add(rule3);

      const rules = manager.getBrokenRules();
      expect(rules.length).toBe(3);
      expect(rules).toContain(rule1);
      expect(rules).toContain(rule2);
      expect(rules).toContain(rule3);
    });
  });

  describe('getBrokenRulesAsString', () => {
    it('debe retornar string vacío si no hay reglas', () => {
      expect(manager.getBrokenRulesAsString()).toBe('');
    });

    it('debe formatear una regla correctamente', () => {
      manager.add(new BrokenRule('name', 'Name is required', 'Error'));

      const result = manager.getBrokenRulesAsString();
      expect(result).toBe('Property: name, Message: Name is required');
    });

    it('debe formatear múltiples reglas con saltos de línea', () => {
      manager.add(new BrokenRule('name', 'Name is required', 'Error'));
      manager.add(new BrokenRule('email', 'Email is invalid', 'Error'));
      manager.add(new BrokenRule('age', 'Age must be positive', 'Warning'));

      const result = manager.getBrokenRulesAsString();
      const lines = result.split('\n');

      expect(lines.length).toBe(3);
      expect(lines[0]).toBe('Property: name, Message: Name is required');
      expect(lines[1]).toBe('Property: email, Message: Email is invalid');
      expect(lines[2]).toBe('Property: age, Message: Age must be positive');
    });
  });

  describe('getPropertiesBrokenRules', () => {
    class TestObject {
      public name: any;
      public email: any;
      public age: any;
    }

    class ValueObjectWithBrokenRules {
      public brokenRules: BrokenRulesManager;

      constructor() {
        this.brokenRules = new BrokenRulesManager();
      }
    }

    it('debe obtener reglas rotas de propiedades que tienen brokenRules', () => {
      const valueObject = new ValueObjectWithBrokenRules();
      valueObject.brokenRules.add(
        new BrokenRule('test', 'Test error', 'Error'),
      );

      const testObject = new TestObject();
      testObject.name = valueObject;

      const result = BrokenRulesManager.getPropertiesBrokenRules(testObject, [
        'name',
      ]);

      expect(result.length).toBe(1);
      expect(result[0].property).toBe('test');
      expect(result[0].message).toBe('Test error');
    });

    it('debe retornar array vacío si no hay reglas rotas', () => {
      const valueObject = new ValueObjectWithBrokenRules();
      const testObject = new TestObject();
      testObject.name = valueObject;

      const result = BrokenRulesManager.getPropertiesBrokenRules(testObject, [
        'name',
      ]);

      expect(result.length).toBe(0);
    });

    it('debe consolidar reglas de múltiples propiedades', () => {
      const valueObject1 = new ValueObjectWithBrokenRules();
      valueObject1.brokenRules.add(new BrokenRule('prop1', 'Error 1', 'Error'));

      const valueObject2 = new ValueObjectWithBrokenRules();
      valueObject2.brokenRules.add(new BrokenRule('prop2', 'Error 2', 'Error'));

      const testObject = new TestObject();
      testObject.name = valueObject1;
      testObject.email = valueObject2;

      const result = BrokenRulesManager.getPropertiesBrokenRules(testObject, [
        'name',
        'email',
      ]);

      expect(result.length).toBe(2);
    });

    it('debe ignorar propiedades nulas o indefinidas', () => {
      const testObject = new TestObject();
      testObject.name = null;
      testObject.email = undefined;

      const result = BrokenRulesManager.getPropertiesBrokenRules(testObject, [
        'name',
        'email',
        'age',
      ]);

      expect(result.length).toBe(0);
    });

    it('debe lanzar error si la instancia es null', () => {
      expect(() => {
        BrokenRulesManager.getPropertiesBrokenRules(null as any, ['name']);
      }).toThrow('instance cannot be null or undefined');
    });

    it('debe lanzar error si la instancia es undefined', () => {
      expect(() => {
        BrokenRulesManager.getPropertiesBrokenRules(undefined as any, ['name']);
      }).toThrow('instance cannot be null or undefined');
    });

    it('debe lanzar error si las propiedades son null', () => {
      const testObject = new TestObject();

      expect(() => {
        BrokenRulesManager.getPropertiesBrokenRules(testObject, null as any);
      }).toThrow('properties cannot be null or undefined');
    });

    it('debe retornar un array de solo lectura', () => {
      const valueObject = new ValueObjectWithBrokenRules();
      valueObject.brokenRules.add(
        new BrokenRule('test', 'Test error', 'Error'),
      );

      const testObject = new TestObject();
      testObject.name = valueObject;

      const result = BrokenRulesManager.getPropertiesBrokenRules(testObject, [
        'name',
      ]);

      // Verificar que es un ReadonlyArray (TypeScript previene push en tiempo de compilación)
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });
  });
});
