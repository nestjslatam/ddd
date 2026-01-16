import { NotifyPropertyChangedContext } from './notify-property-changed.context';
import { NotifyPropertyChangedContextArgs } from './notify-property-changed.context-args';
import { ReflectionTypeExtensions } from './reflection-type-extensions';

export type NotifyPropertyChangedHandler = (
  sender: AbstractNotifyPropertyChanged,
  e: NotifyPropertyChangedContextArgs,
) => void;

export abstract class AbstractNotifyPropertyChanged {
  // Diccionario de propiedades (equivalente a Dictionary en C#)
  private readonly properties = new Map<string, NotifyPropertyChangedContext>();

  protected isCallbackInvokingEnabled: boolean = true;
  protected isEventInvokingEnabled: boolean = true;

  // Evento simple para suscriptores externos (emula INotifyPropertyChanged)
  public onPropertyChanged?: (propertyName: string) => void;

  protected constructor() {}

  protected registerProperty(
    name: string,
    type: any,
    defaultValue: any,
    handler?: NotifyPropertyChangedHandler,
  ): void {
    if (this.properties.has(name)) {
      throw new Error(
        `Esta clase ya contiene una propiedad registrada llamada '${name}'.`,
      );
    }

    AbstractNotifyPropertyChanged.validateValueForType(defaultValue, type);
    this.properties.set(
      name,
      new NotifyPropertyChangedContext(defaultValue, type, handler),
    );
  }

  public registerPropertyChangedCallback(
    propertyName: string,
    handler: NotifyPropertyChangedHandler,
  ): void {
    const context = this.getPropertyContext(propertyName);
    context.addCallback(handler);
  }

  protected getValuePropertyChanged(propertyName: string): any {
    return this.getPropertyContext(propertyName).value;
  }

  protected setValuePropertyChanged(
    value: any,
    propertyName: string,
    force: boolean = false,
  ): void {
    const context = this.getPropertyContext(propertyName);

    AbstractNotifyPropertyChanged.validateValueForType(value, context.type);

    const oldValue = context.value;
    const valuesEqual = oldValue === value;

    if (force || !valuesEqual) {
      context.value = value;

      if (this.isCallbackInvokingEnabled) {
        context.invokePropertyChangedCallback(
          this,
          new NotifyPropertyChangedContextArgs(oldValue, value),
        );
      }

      if (this.isEventInvokingEnabled && this.onPropertyChanged) {
        this.onPropertyChanged(propertyName);
      }
    }
  }

  private getPropertyContext(
    propertyName: string,
  ): NotifyPropertyChangedContext {
    const context = this.properties.get(propertyName);
    if (!context) {
      throw new Error(
        `No hay una propiedad registrada llamada '${propertyName}'.`,
      );
    }
    return context;
  }

  private static validateValueForType(value: any, type: any): void {
    // Manejo de nulos (Equivale a la lógica de Nullable en C#)
    if (value === null || value === undefined) {
      const isValueType = ReflectionTypeExtensions.getIsValueType(type);

      // En C#, los ValueTypes no aceptan null a menos que sean Nullable<T>
      if (isValueType) {
        throw new Error(
          `El tipo '${type.name || type}' no es un tipo nulable.`,
        );
      }
      return;
    }

    // Validación de asignación
    const sourceType = value.constructor;
    if (!ReflectionTypeExtensions.getIsAssignableFrom(type, sourceType)) {
      throw new Error(
        `El valor especificado no se puede asignar a una propiedad de tipo (${
          type.name || type
        })`,
      );
    }
  }
}
