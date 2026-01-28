import { BrokenRule } from './broken-rule';
import { BrokenRulesExtension } from './broken-rules-extension';
import { BrokenRulesManager } from '../../../broken-rules.manager';

describe('BrokenRulesExtension', () => {
  describe('getPropertiesBrokenRules', () => {
    class TestObject {
      public name: any;
      public email: any;
      public age: any;
      public optional: any;
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

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
      ]);

      expect(result.length).toBe(1);
      expect(result[0].property).toBe('test');
      expect(result[0].message).toBe('Test error');
      expect(result[0].severity).toBe('Error');
    });

    it('debe retornar array vacío si no hay reglas rotas', () => {
      const valueObject = new ValueObjectWithBrokenRules();
      const testObject = new TestObject();
      testObject.name = valueObject;

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
      ]);

      expect(result.length).toBe(0);
    });

    it('debe consolidar reglas de múltiples propiedades', () => {
      const valueObject1 = new ValueObjectWithBrokenRules();
      valueObject1.brokenRules.add(new BrokenRule('prop1', 'Error 1', 'Error'));

      const valueObject2 = new ValueObjectWithBrokenRules();
      valueObject2.brokenRules.add(new BrokenRule('prop2', 'Error 2', 'Error'));

      const valueObject3 = new ValueObjectWithBrokenRules();
      valueObject3.brokenRules.add(
        new BrokenRule('prop3', 'Error 3', 'Warning'),
      );

      const testObject = new TestObject();
      testObject.name = valueObject1;
      testObject.email = valueObject2;
      testObject.age = valueObject3;

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
        'email',
        'age',
      ]);

      expect(result.length).toBe(3);
      expect(result.some((r) => r.property === 'prop1')).toBe(true);
      expect(result.some((r) => r.property === 'prop2')).toBe(true);
      expect(result.some((r) => r.property === 'prop3')).toBe(true);
    });

    it('debe ignorar propiedades nulas', () => {
      const valueObject = new ValueObjectWithBrokenRules();
      valueObject.brokenRules.add(
        new BrokenRule('test', 'Test error', 'Error'),
      );

      const testObject = new TestObject();
      testObject.name = valueObject;
      testObject.email = null;
      testObject.age = undefined;

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
        'email',
        'age',
      ]);

      expect(result.length).toBe(1);
      expect(result[0].property).toBe('test');
    });

    it('debe ignorar propiedades que no tienen brokenRules', () => {
      const testObject = new TestObject();
      testObject.name = { someProperty: 'value' };
      testObject.email = 'string value';
      testObject.age = 123;

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
        'email',
        'age',
      ]);

      expect(result.length).toBe(0);
    });

    it('debe ignorar propiedades que tienen brokenRules pero está vacío', () => {
      const valueObject1 = new ValueObjectWithBrokenRules();
      valueObject1.brokenRules.add(new BrokenRule('prop1', 'Error 1', 'Error'));

      const valueObject2 = new ValueObjectWithBrokenRules();
      // valueObject2 no tiene reglas rotas

      const testObject = new TestObject();
      testObject.name = valueObject1;
      testObject.email = valueObject2;

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
        'email',
      ]);

      expect(result.length).toBe(1);
      expect(result[0].property).toBe('prop1');
    });

    it('debe ignorar propiedades que no tienen el método getBrokenRules', () => {
      const testObject = new TestObject();
      testObject.name = {
        brokenRules: {
          // No tiene el método getBrokenRules
        },
      };

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
      ]);

      expect(result.length).toBe(0);
    });

    it('debe ignorar propiedades donde brokenRules no es un objeto', () => {
      const testObject = new TestObject();
      testObject.name = {
        brokenRules: 'not an object',
      };

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
      ]);

      expect(result.length).toBe(0);
    });

    it('debe retornar un ReadonlyArray', () => {
      const valueObject = new ValueObjectWithBrokenRules();
      valueObject.brokenRules.add(
        new BrokenRule('test', 'Test error', 'Error'),
      );

      const testObject = new TestObject();
      testObject.name = valueObject;

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
      ]);

      // Verificar que es un ReadonlyArray (TypeScript previene push en tiempo de compilación)
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('debe manejar múltiples reglas rotas de una sola propiedad', () => {
      const valueObject = new ValueObjectWithBrokenRules();
      valueObject.brokenRules.add(new BrokenRule('prop1', 'Error 1', 'Error'));
      valueObject.brokenRules.add(new BrokenRule('prop2', 'Error 2', 'Error'));
      valueObject.brokenRules.add(
        new BrokenRule('prop3', 'Error 3', 'Warning'),
      );

      const testObject = new TestObject();
      testObject.name = valueObject;

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
      ]);

      expect(result.length).toBe(3);
      expect(result.some((r) => r.property === 'prop1')).toBe(true);
      expect(result.some((r) => r.property === 'prop2')).toBe(true);
      expect(result.some((r) => r.property === 'prop3')).toBe(true);
    });

    it('debe manejar un array vacío de propiedades', () => {
      const testObject = new TestObject();

      const result = BrokenRulesExtension.getPropertiesBrokenRules(
        testObject,
        [],
      );

      expect(result.length).toBe(0);
    });

    it('debe lanzar error si la instancia es null', () => {
      expect(() => {
        BrokenRulesExtension.getPropertiesBrokenRules(null as any, ['name']);
      }).toThrow('ArgumentNullException: instance cannot be null or undefined');
    });

    it('debe lanzar error si la instancia es undefined', () => {
      expect(() => {
        BrokenRulesExtension.getPropertiesBrokenRules(undefined as any, [
          'name',
        ]);
      }).toThrow('ArgumentNullException: instance cannot be null or undefined');
    });

    it('debe lanzar error si las propiedades son null', () => {
      const testObject = new TestObject();

      expect(() => {
        BrokenRulesExtension.getPropertiesBrokenRules(testObject, null as any);
      }).toThrow('ArgumentNullException: properties cannot be null');
    });

    it('debe lanzar error si las propiedades son undefined', () => {
      const testObject = new TestObject();

      expect(() => {
        BrokenRulesExtension.getPropertiesBrokenRules(
          testObject,
          undefined as any,
        );
      }).toThrow('ArgumentNullException: properties cannot be null');
    });

    it('debe manejar propiedades con diferentes tipos de severity', () => {
      const valueObject1 = new ValueObjectWithBrokenRules();
      valueObject1.brokenRules.add(
        new BrokenRule('prop1', 'Error message', 'Error'),
      );

      const valueObject2 = new ValueObjectWithBrokenRules();
      valueObject2.brokenRules.add(
        new BrokenRule('prop2', 'Warning message', 'Warning'),
      );

      const testObject = new TestObject();
      testObject.name = valueObject1;
      testObject.email = valueObject2;

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
        'email',
      ]);

      expect(result.length).toBe(2);
      expect(result.find((r) => r.property === 'prop1')?.severity).toBe(
        'Error',
      );
      expect(result.find((r) => r.property === 'prop2')?.severity).toBe(
        'Warning',
      );
    });

    it('debe manejar propiedades que tienen brokenRules pero no es una función', () => {
      const testObject = new TestObject();
      testObject.name = {
        brokenRules: {
          getBrokenRules: 'not a function',
        },
      };

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
      ]);

      expect(result.length).toBe(0);
    });

    it('debe manejar propiedades donde brokenRules es null', () => {
      const testObject = new TestObject();
      testObject.name = {
        brokenRules: null,
      };

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
      ]);

      expect(result.length).toBe(0);
    });

    it('debe manejar propiedades donde brokenRules es undefined', () => {
      const testObject = new TestObject();
      testObject.name = {
        brokenRules: undefined,
      };

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
      ]);

      expect(result.length).toBe(0);
    });

    it('debe consolidar correctamente reglas de propiedades mezcladas (con y sin reglas)', () => {
      const valueObject1 = new ValueObjectWithBrokenRules();
      valueObject1.brokenRules.add(new BrokenRule('prop1', 'Error 1', 'Error'));

      const valueObject2 = new ValueObjectWithBrokenRules();
      // Sin reglas

      const valueObject3 = new ValueObjectWithBrokenRules();
      valueObject3.brokenRules.add(new BrokenRule('prop3', 'Error 3', 'Error'));

      const testObject = new TestObject();
      testObject.name = valueObject1;
      testObject.email = valueObject2;
      testObject.age = valueObject3;
      testObject.optional = null;

      const result = BrokenRulesExtension.getPropertiesBrokenRules(testObject, [
        'name',
        'email',
        'age',
        'optional',
      ]);

      expect(result.length).toBe(2);
      expect(result.some((r) => r.property === 'prop1')).toBe(true);
      expect(result.some((r) => r.property === 'prop3')).toBe(true);
    });
  });
});
