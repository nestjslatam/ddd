import { NotifyPropertyChangedContextArgs } from "./notify-property-changed.context-args";
import { AbstractNotifyPropertyChanged, NotifyPropertyChangedHandler } from "./notify-property-changed.base";

export class NotifyPropertyChangedContext {
  public value: any;
  public readonly type: any; // En TS, el 'Type' es el constructor o el nombre del tipo
  
  // Usamos un Set para evitar callbacks duplicados, similar al += de C#
  private readonly callbacks: Set<NotifyPropertyChangedHandler> = new Set();

  constructor(
    defaultValue: any,
    type: any,
    handler?: NotifyPropertyChangedHandler
  ) {
    this.value = defaultValue;
    this.type = type;
    if (handler) {
      this.callbacks.add(handler);
    }
  }

  /**
   * Agrega un callback al conjunto de callbacks.
   * @param handler El handler a agregar.
   */
  public addCallback(handler: NotifyPropertyChangedHandler): void {
    this.callbacks.add(handler);
  }

  public invokePropertyChangedCallback(
    sender: AbstractNotifyPropertyChanged, 
    e: NotifyPropertyChangedContextArgs
  ): void {
    this.callbacks.forEach(callback => callback(sender, e));
  }
}