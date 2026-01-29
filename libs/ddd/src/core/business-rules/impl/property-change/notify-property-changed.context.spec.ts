import { NotifyPropertyChangedContext } from './notify-property-changed.context';
import { NotifyPropertyChangedContextArgs } from './notify-property-changed.context-args';
import {
  AbstractNotifyPropertyChanged,
  NotifyPropertyChangedHandler,
} from './notify-property-changed.base';

describe('NotifyPropertyChangedContext', () => {
  class TestNotifyPropertyChanged extends AbstractNotifyPropertyChanged {
    constructor() {
      super();
      this.registerProperty('testProp', String, 'default');
    }
  }

  let context: NotifyPropertyChangedContext;
  let sender: TestNotifyPropertyChanged;

  beforeEach(() => {
    sender = new TestNotifyPropertyChanged();
    context = new NotifyPropertyChangedContext('initial', String);
  });

  describe('constructor', () => {
    it('debe inicializar con valor y tipo', () => {
      expect(context.value).toBe('initial');
      expect(context.type).toBe(String);
    });

    it('debe inicializar con handler opcional', () => {
      const handler: NotifyPropertyChangedHandler = jest.fn();
      const contextWithHandler = new NotifyPropertyChangedContext(
        'value',
        String,
        handler,
      );

      expect(contextWithHandler.value).toBe('value');
      expect(contextWithHandler.type).toBe(String);
    });

    it('debe inicializar callbacks vacío si no se proporciona handler', () => {
      expect(context).toBeDefined();
    });
  });

  describe('addCallback', () => {
    it('debe agregar un callback al conjunto', () => {
      const handler: NotifyPropertyChangedHandler = jest.fn();

      context.addCallback(handler);

      const args = new NotifyPropertyChangedContextArgs('old', 'new');
      context.invokePropertyChangedCallback(sender, args);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(sender, args);
    });

    it('debe evitar callbacks duplicados', () => {
      const handler: NotifyPropertyChangedHandler = jest.fn();

      context.addCallback(handler);
      context.addCallback(handler);
      context.addCallback(handler);

      const args = new NotifyPropertyChangedContextArgs('old', 'new');
      context.invokePropertyChangedCallback(sender, args);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('debe permitir múltiples callbacks diferentes', () => {
      const handler1: NotifyPropertyChangedHandler = jest.fn();
      const handler2: NotifyPropertyChangedHandler = jest.fn();
      const handler3: NotifyPropertyChangedHandler = jest.fn();

      context.addCallback(handler1);
      context.addCallback(handler2);
      context.addCallback(handler3);

      const args = new NotifyPropertyChangedContextArgs('old', 'new');
      context.invokePropertyChangedCallback(sender, args);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });
  });

  describe('invokePropertyChangedCallback', () => {
    it('debe invocar todos los callbacks registrados', () => {
      const handler1: NotifyPropertyChangedHandler = jest.fn();
      const handler2: NotifyPropertyChangedHandler = jest.fn();

      context.addCallback(handler1);
      context.addCallback(handler2);

      const args = new NotifyPropertyChangedContextArgs('old', 'new');
      context.invokePropertyChangedCallback(sender, args);

      expect(handler1).toHaveBeenCalledWith(sender, args);
      expect(handler2).toHaveBeenCalledWith(sender, args);
    });

    it('debe pasar los argumentos correctos a los callbacks', () => {
      const handler: NotifyPropertyChangedHandler = jest.fn();

      context.addCallback(handler);

      const args = new NotifyPropertyChangedContextArgs('previous', 'current');
      context.invokePropertyChangedCallback(sender, args);

      expect(handler).toHaveBeenCalledWith(sender, args);
      expect(handler).toHaveBeenCalledWith(
        expect.any(TestNotifyPropertyChanged),
        expect.objectContaining({
          previousValue: 'previous',
          newValue: 'current',
        }),
      );
    });

    it('no debe invocar callbacks si no hay ninguno registrado', () => {
      const args = new NotifyPropertyChangedContextArgs('old', 'new');

      expect(() => {
        context.invokePropertyChangedCallback(sender, args);
      }).not.toThrow();
    });

    it('debe invocar callbacks en el orden de registro', () => {
      const callOrder: number[] = [];
      const handler1: NotifyPropertyChangedHandler = () => callOrder.push(1);
      const handler2: NotifyPropertyChangedHandler = () => callOrder.push(2);
      const handler3: NotifyPropertyChangedHandler = () => callOrder.push(3);

      context.addCallback(handler1);
      context.addCallback(handler2);
      context.addCallback(handler3);

      const args = new NotifyPropertyChangedContextArgs('old', 'new');
      context.invokePropertyChangedCallback(sender, args);

      expect(callOrder).toEqual([1, 2, 3]);
    });
  });

  describe('value property', () => {
    it('debe permitir establecer y obtener el valor', () => {
      context.value = 'new value';
      expect(context.value).toBe('new value');
    });

    it('debe permitir cambiar el valor múltiples veces', () => {
      context.value = 'value1';
      expect(context.value).toBe('value1');

      context.value = 'value2';
      expect(context.value).toBe('value2');

      context.value = 'value3';
      expect(context.value).toBe('value3');
    });
  });
});
