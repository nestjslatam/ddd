/**
 * Interfaz para el administrador de estado de seguimiento.
 * Define las operaciones básicas para gestionar el estado de tracking de una entidad.
 */
export interface ITrackingStateManager {
  /**
   * Indica si la entidad es nueva.
   */
  readonly isNew: boolean;

  /**
   * Indica si la entidad ha sido modificada.
   */
  readonly isDirty: boolean;

  /**
   * Indica si la entidad se ha auto-eliminado.
   */
  readonly isSelfDeleted: boolean;

  /**
   * Indica si la entidad ha sido eliminada.
   */
  readonly isDeleted: boolean;

  /**
   * Marca la entidad como modificada.
   */
  markAsDirty(): void;

  /**
   * Marca la entidad como nueva.
   */
  markAsNew(): void;

  /**
   * Marca la entidad como auto-eliminada.
   */
  markAsSelfDeleted(): void;

  /**
   * Marca la entidad como eliminada.
   */
  markAsDeleted(): void;

  /**
   * Marca la entidad como limpia (sin cambios).
   */
  markAsClean(): void;
}
