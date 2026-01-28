import { NotifyPropertyChangedContextArgs } from './notify-property-changed.context-args';

describe('NotifyPropertyChangedContextArgs', () => {
  it('debe crear una instancia con valores previos y nuevos', () => {
    const args = new NotifyPropertyChangedContextArgs('old', 'new');

    expect(args.previousValue).toBe('old');
    expect(args.newValue).toBe('new');
    expect(args.handled).toBe(false);
  });

  it('debe inicializar handled como false por defecto', () => {
    const args = new NotifyPropertyChangedContextArgs(1, 2);

    expect(args.handled).toBe(false);
  });

  it('debe permitir establecer handled a true', () => {
    const args = new NotifyPropertyChangedContextArgs('a', 'b');

    args.handled = true;

    expect(args.handled).toBe(true);
  });

  it('debe manejar valores nulos correctamente', () => {
    const args1 = new NotifyPropertyChangedContextArgs(null, 'new');
    expect(args1.previousValue).toBeNull();
    expect(args1.newValue).toBe('new');

    const args2 = new NotifyPropertyChangedContextArgs('old', null);
    expect(args2.previousValue).toBe('old');
    expect(args2.newValue).toBeNull();

    const args3 = new NotifyPropertyChangedContextArgs(null, null);
    expect(args3.previousValue).toBeNull();
    expect(args3.newValue).toBeNull();
  });

  it('debe manejar valores undefined correctamente', () => {
    const args1 = new NotifyPropertyChangedContextArgs(undefined, 'new');
    expect(args1.previousValue).toBeUndefined();
    expect(args1.newValue).toBe('new');

    const args2 = new NotifyPropertyChangedContextArgs('old', undefined);
    expect(args2.previousValue).toBe('old');
    expect(args2.newValue).toBeUndefined();
  });

  it('debe manejar objetos complejos correctamente', () => {
    const oldObj = { id: 1, name: 'old' };
    const newObj = { id: 2, name: 'new' };

    const args = new NotifyPropertyChangedContextArgs(oldObj, newObj);

    expect(args.previousValue).toBe(oldObj);
    expect(args.newValue).toBe(newObj);
    expect(args.previousValue.id).toBe(1);
    expect(args.newValue.id).toBe(2);
  });

  it('debe manejar arrays correctamente', () => {
    const oldArray = [1, 2, 3];
    const newArray = [4, 5, 6];

    const args = new NotifyPropertyChangedContextArgs(oldArray, newArray);

    expect(args.previousValue).toBe(oldArray);
    expect(args.newValue).toBe(newArray);
    expect(args.previousValue.length).toBe(3);
    expect(args.newValue.length).toBe(3);
  });
});
