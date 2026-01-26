import {
  IChangeDetector,
  IProps,
  ITrackingProps,
  ITrackingStateManager,
  ITrackingStateTransitions,
  TrackingStateTransition,
  NestedPropertyChangeDetector,
} from './core';

export class TrackingStateManager
  implements ITrackingStateManager, ITrackingStateTransitions
{
  // Usamos getters privados y setters para emular el 'private set' de C#
  private _isNew: boolean = false;
  private _isDirty: boolean = false;
  private _isSelfDeleted: boolean = false;
  private _isDeleted: boolean = false;

  /**
   * Detector de cambios. Inyectado para seguir DIP.
   * Por defecto usa NestedPropertyChangeDetector.
   */
  private readonly changeDetector: IChangeDetector;

  public get isNew(): boolean {
    return this._isNew;
  }

  public get isDirty(): boolean {
    return this._isDirty;
  }

  public get isSelfDeleted(): boolean {
    return this._isSelfDeleted;
  }

  public get isDeleted(): boolean {
    return this._isDeleted;
  }

  /**
   * Constructor que permite inyectar un detector de cambios personalizado.
   * @param changeDetector Opcional. Si no se proporciona, usa NestedPropertyChangeDetector por defecto.
   */
  constructor(changeDetector?: IChangeDetector) {
    this.changeDetector = changeDetector || new NestedPropertyChangeDetector();
    this.markAsClean();
  }

  public get trackingProps(): ITrackingProps {
    return {
      isDirty: this._isDirty,
      isNew: this._isNew,
      isDeleted: this._isDeleted,
      isSelfDeleted: this._isSelfDeleted,
    };
  }

  /**
   * Obtiene el tracking de las propiedades especificadas.
   * Delega la detección de cambios al IChangeDetector inyectado.
   * @param props Las propiedades a analizar.
   * @returns Esta instancia de TrackingStateManager (fluent interface).
   */
  public getTracking<TProp extends IProps>(props: TProp): this {
    this.changeDetector.detectChanges(props, this);
    return this;
  }

  /**
   * Marca la entidad como modificada.
   * Usa TrackingStateTransition para evitar duplicación de código.
   */
  public markAsDirty(): void {
    TrackingStateTransition.toDirty(this);
  }

  /**
   * Marca la entidad como nueva.
   * Usa TrackingStateTransition para evitar duplicación de código.
   */
  public markAsNew(): void {
    TrackingStateTransition.toNew(this);
  }

  /**
   * Marca la entidad como auto-eliminada.
   * Usa TrackingStateTransition para evitar duplicación de código.
   */
  public markAsSelfDeleted(): void {
    TrackingStateTransition.toSelfDeleted(this);
  }

  /**
   * Marca la entidad como eliminada.
   * Usa TrackingStateTransition para evitar duplicación de código.
   */
  public markAsDeleted(): void {
    TrackingStateTransition.toDeleted(this);
  }

  /**
   * Marca la entidad como limpia (sin cambios).
   * Resetea todos los estados a false.
   */
  public markAsClean(): void {
    this._isDirty = false;
    this._isNew = false;
    this._isSelfDeleted = false;
    this._isDeleted = false;
  }

  // Implementación de ITrackingStateManagerInternal para TrackingStateTransition
  setDirty(value: boolean): void {
    this._isDirty = value;
  }

  setNew(value: boolean): void {
    this._isNew = value;
  }

  setSelfDeleted(value: boolean): void {
    this._isSelfDeleted = value;
  }

  setDeleted(value: boolean): void {
    this._isDeleted = value;
  }
}
