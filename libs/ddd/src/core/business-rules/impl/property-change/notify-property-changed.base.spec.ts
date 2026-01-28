import { AbstractNotifyPropertyChanged } from './notify-property-changed.base';
import { NotifyPropertyChangedContextArgs } from './notify-property-changed.context-args';
import { ReflectionTypeExtensions } from './reflection-type-extensions';

describe('AbstractNotifyPropertyChanged', () => {
  class TestClass extends AbstractNotifyPropertyChanged {
    constructor() {
      super();
      this.registerProperty('name', String, 'default');
      this.registerProperty('age', Number, 0);
      this.registerProperty('active', Boolean, false);
    }

    public get Name(): string {
      return this.getValuePropertyChanged('name');
    }

    public set Name(value: string) {
      this.setValuePropertyChanged(value, 'name');
    }

    public get Age(): number {
      return this.getValuePropertyChanged('age');
    }

    public set Age(value: number) {
      this.setValuePropertyChanged(value, 'age');
    }

    public get Active(): boolean {
      return this.getValuePropertyChanged('active');
    }

    public set Active(value: boolean) {
      this.setValuePropertyChanged(value, 'active');
    }
  }

  let instance: TestClass;

  beforeEach(() => {
    instance = new TestClass();
  });

  describe('registerProperty', () => {
    it('debe registrar una propiedad correctamente', () => {
      class NewTestClass extends AbstractNotifyPropertyChanged {
        constructor() {
          super();
          this.registerProperty('test', String, 'value');
        }
      }

      const newInstance = new NewTestClass();
      expect(newInstance).toBeDefined();
    });

    it('debe lanzar error si se intenta registrar la misma propiedad dos veces', () => {
      class DuplicatePropertyClass extends AbstractNotifyPropertyChanged {
        constructor() {
          super();
          this.registerProperty('test', String, 'value');
        }

        public registerDuplicate() {
          this.registerProperty('test', String, 'value');
        }
      }

      const duplicateInstance = new DuplicatePropertyClass();

      expect(() => {
        duplicateInstance.registerDuplicate();
      }).toThrow(
        "This class already contains a registered property called 'test'.",
      );
    });

    it('debe validar el tipo del valor por defecto', () => {
      class InvalidDefaultClass extends AbstractNotifyPropertyChanged {
        constructor() {
          super();
        }

        public registerWithInvalidDefault() {
          this.registerProperty('test', String, 123);
        }
      }

      const invalidInstance = new InvalidDefaultClass();

      expect(() => {
        invalidInstance.registerWithInvalidDefault();
      }).toThrow();
    });

    it('debe rechazar null para tipos primitivos', () => {
      class NullValueClass extends AbstractNotifyPropertyChanged {
        constructor() {
          super();
        }

        public registerWithNull() {
          this.registerProperty('test', String, null);
        }
      }

      const nullInstance = new NullValueClass();

      expect(() => {
        nullInstance.registerWithNull();
      }).toThrow();
    });
  });

  describe('getValuePropertyChanged', () => {
    it('debe retornar el valor por defecto de la propiedad', () => {
      expect(instance.Name).toBe('default');
      expect(instance.Age).toBe(0);
      expect(instance.Active).toBe(false);
    });

    it('debe lanzar error si la propiedad no está registrada', () => {
      class UnregisteredPropertyClass extends AbstractNotifyPropertyChanged {
        constructor() {
          super();
        }

        public getUnregistered() {
          return this.getValuePropertyChanged('unregistered');
        }
      }

      const unregisteredInstance = new UnregisteredPropertyClass();

      expect(() => {
        unregisteredInstance.getUnregistered();
      }).toThrow("No hay una propiedad registrada llamada 'unregistered'.");
    });
  });

  describe('setValuePropertyChanged', () => {
    it('debe establecer el valor de la propiedad', () => {
      instance.Name = 'John';
      expect(instance.Name).toBe('John');

      instance.Age = 25;
      expect(instance.Age).toBe(25);

      instance.Active = true;
      expect(instance.Active).toBe(true);
    });

    it('debe validar el tipo del valor antes de establecerlo', () => {
      expect(() => {
        instance.Name = 123 as any;
      }).toThrow();

      expect(() => {
        instance.Age = 'not a number' as any;
      }).toThrow();
    });

    it('debe rechazar null para tipos primitivos', () => {
      expect(() => {
        instance.Name = null as any;
      }).toThrow();

      expect(() => {
        instance.Age = null as any;
      }).toThrow();
    });

    it('debe aceptar null para tipos no primitivos', () => {
      class CustomObject {
        constructor(public value: string) {}
      }

      class NullableClass extends TestClass {
        constructor() {
          super();
          this.registerProperty('custom', CustomObject, null);
        }

        public get Custom(): CustomObject | null {
          return this.getValuePropertyChanged('custom');
        }

        public set Custom(value: CustomObject | null) {
          this.setValuePropertyChanged(value, 'custom');
        }
      }

      const nullableInstance = new NullableClass();

      // Debe permitir null para tipos no primitivos
      nullableInstance.Custom = null;
      expect(nullableInstance.Custom).toBeNull();

      // Debe permitir establecer un valor después de null
      const obj = new CustomObject('test');
      nullableInstance.Custom = obj;
      expect(nullableInstance.Custom).toBe(obj);
    });

    it('no debe actualizar el valor si es igual al actual', () => {
      const onPropertyChangedSpy = jest.fn();
      instance.onPropertyChanged = onPropertyChangedSpy;

      instance.Name = 'test';
      onPropertyChangedSpy.mockClear();

      instance.Name = 'test';

      expect(onPropertyChangedSpy).not.toHaveBeenCalled();
    });

    it('debe actualizar el valor si force es true incluso si es igual', () => {
      class ForceTestClass extends TestClass {
        public testForce(value: string) {
          this.setValuePropertyChanged(value, 'name', true);
        }
      }

      const forceInstance = new ForceTestClass();
      const onPropertyChangedSpy = jest.fn();
      forceInstance.onPropertyChanged = onPropertyChangedSpy;

      forceInstance.Name = 'test';
      onPropertyChangedSpy.mockClear();

      forceInstance.testForce('test');

      expect(onPropertyChangedSpy).toHaveBeenCalledWith('name');
    });

    it('debe lanzar error si la propiedad no está registrada', () => {
      class UnregisteredTestClass extends TestClass {
        public testUnregistered() {
          this.setValuePropertyChanged('value', 'unregistered');
        }
      }

      const unregisteredInstance = new UnregisteredTestClass();

      expect(() => {
        unregisteredInstance.testUnregistered();
      }).toThrow("No hay una propiedad registrada llamada 'unregistered'.");
    });
  });

  describe('registerPropertyChangedCallback', () => {
    it('debe registrar un callback para una propiedad', () => {
      const callback = jest.fn();

      instance.registerPropertyChangedCallback('name', callback);

      instance.Name = 'new value';

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        instance,
        expect.objectContaining({
          previousValue: 'default',
          newValue: 'new value',
        }),
      );
    });

    it('debe invocar múltiples callbacks registrados', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      instance.registerPropertyChangedCallback('name', callback1);
      instance.registerPropertyChangedCallback('name', callback2);
      instance.registerPropertyChangedCallback('name', callback3);

      instance.Name = 'new value';

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);
    });

    it('debe lanzar error si la propiedad no está registrada', () => {
      const callback = jest.fn();

      expect(() => {
        instance.registerPropertyChangedCallback('unregistered', callback);
      }).toThrow("No hay una propiedad registrada llamada 'unregistered'.");
    });
  });

  describe('onPropertyChanged event', () => {
    it('debe invocar el evento cuando una propiedad cambia', () => {
      const eventHandler = jest.fn();
      instance.onPropertyChanged = eventHandler;

      instance.Name = 'new name';

      expect(eventHandler).toHaveBeenCalledTimes(1);
      expect(eventHandler).toHaveBeenCalledWith('name');
    });

    it('no debe invocar el evento si el valor no cambia', () => {
      const eventHandler = jest.fn();
      instance.onPropertyChanged = eventHandler;

      instance.Name = 'test';
      eventHandler.mockClear();

      instance.Name = 'test';

      expect(eventHandler).not.toHaveBeenCalled();
    });

    it('no debe lanzar error si onPropertyChanged no está definido', () => {
      instance.onPropertyChanged = undefined;

      expect(() => {
        instance.Name = 'new value';
      }).not.toThrow();
    });
  });

  describe('isCallbackInvokingEnabled', () => {
    class CallbackTestClass extends TestClass {
      public disableCallbacks() {
        this.isCallbackInvokingEnabled = false;
      }

      public enableCallbacks() {
        this.isCallbackInvokingEnabled = true;
      }
    }

    it('debe deshabilitar la invocación de callbacks cuando está en false', () => {
      const callbackTestInstance = new CallbackTestClass();
      const callback = jest.fn();
      callbackTestInstance.registerPropertyChangedCallback('name', callback);

      callbackTestInstance.disableCallbacks();
      callbackTestInstance.Name = 'new value';

      expect(callback).not.toHaveBeenCalled();
    });

    it('debe habilitar la invocación de callbacks cuando está en true', () => {
      const callbackTestInstance = new CallbackTestClass();
      const callback = jest.fn();
      callbackTestInstance.registerPropertyChangedCallback('name', callback);

      callbackTestInstance.disableCallbacks();
      callbackTestInstance.enableCallbacks();
      callbackTestInstance.Name = 'new value';

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('isEventInvokingEnabled', () => {
    class EventTestClass extends TestClass {
      public disableEvents() {
        this.isEventInvokingEnabled = false;
      }

      public enableEvents() {
        this.isEventInvokingEnabled = true;
      }
    }

    it('debe deshabilitar la invocación del evento cuando está en false', () => {
      const eventTestInstance = new EventTestClass();
      const eventHandler = jest.fn();
      eventTestInstance.onPropertyChanged = eventHandler;

      eventTestInstance.disableEvents();
      eventTestInstance.Name = 'new value';

      expect(eventHandler).not.toHaveBeenCalled();
    });

    it('debe habilitar la invocación del evento cuando está en true', () => {
      const eventTestInstance = new EventTestClass();
      const eventHandler = jest.fn();
      eventTestInstance.onPropertyChanged = eventHandler;

      eventTestInstance.disableEvents();
      eventTestInstance.enableEvents();
      eventTestInstance.Name = 'new value';

      expect(eventHandler).toHaveBeenCalled();
    });
  });

  describe('herencia de clases', () => {
    it('debe permitir herencia de clases personalizadas', () => {
      class DerivedClass extends TestClass {
        constructor() {
          super();
          this.registerProperty('email', String, '');
        }

        public get Email(): string {
          return this.getValuePropertyChanged('email');
        }

        public set Email(value: string) {
          this.setValuePropertyChanged(value, 'email');
        }
      }

      const derived = new DerivedClass();

      expect(derived.Name).toBe('default');
      expect(derived.Email).toBe('');

      derived.Email = 'test@example.com';
      expect(derived.Email).toBe('test@example.com');
    });
  });

  describe('validación de tipos con objetos personalizados', () => {
    class CustomObject {
      constructor(public value: string) {}
    }

    class CustomClass extends AbstractNotifyPropertyChanged {
      constructor() {
        super();
        this.registerProperty(
          'custom',
          CustomObject,
          new CustomObject('default'),
        );
      }

      public get Custom(): CustomObject {
        return this.getValuePropertyChanged('custom');
      }

      public set Custom(value: CustomObject) {
        this.setValuePropertyChanged(value, 'custom');
      }
    }

    it('debe aceptar objetos del tipo correcto', () => {
      const customInstance = new CustomClass();
      const newObject = new CustomObject('new');

      customInstance.Custom = newObject;

      expect(customInstance.Custom).toBe(newObject);
      expect(customInstance.Custom.value).toBe('new');
    });

    it('debe rechazar objetos de tipo incorrecto', () => {
      class OtherObject {
        constructor(public value: string) {}
      }

      const customInstance = new CustomClass();
      const otherObject = new OtherObject('other');

      expect(() => {
        customInstance.Custom = otherObject as any;
      }).toThrow();
    });
  });
});
