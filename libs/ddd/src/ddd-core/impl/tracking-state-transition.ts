/**
 * Interfaz interna para permitir la actualización directa de estados.
 * Solo debe ser implementada por TrackingStateManager.
 */
export interface ITrackingStateManagerInternal {
  setDirty(value: boolean): void;
  setNew(value: boolean): void;
  setSelfDeleted(value: boolean): void;
  setDeleted(value: boolean): void;
}

/**
 * Estrategia para manejar transiciones de estado en el tracking.
 * Centraliza la lógica de cambio de estados para evitar duplicación.
 */
export class TrackingStateTransition {
  /**
   * Aplica una transición de estado, reseteando todos los demás estados.
   * @param manager El administrador de estado (debe implementar ITrackingStateManagerInternal).
   * @param stateUpdate Función que actualiza el estado específico.
   */
  private static applyTransition(
    manager: ITrackingStateManagerInternal,
    stateUpdate: (manager: ITrackingStateManagerInternal) => void,
  ): void {
    // Primero reseteamos todos los estados
    manager.setDirty(false);
    manager.setNew(false);
    manager.setSelfDeleted(false);
    manager.setDeleted(false);
    // Luego aplicamos el estado específico
    stateUpdate(manager);
  }

  /**
   * Transición a estado "dirty".
   */
  static toDirty(manager: ITrackingStateManagerInternal): void {
    this.applyTransition(manager, (m) => {
      m.setDirty(true);
    });
  }

  /**
   * Transición a estado "new".
   */
  static toNew(manager: ITrackingStateManagerInternal): void {
    this.applyTransition(manager, (m) => {
      m.setNew(true);
    });
  }

  /**
   * Transición a estado "selfDeleted".
   */
  static toSelfDeleted(manager: ITrackingStateManagerInternal): void {
    this.applyTransition(manager, (m) => {
      m.setSelfDeleted(true);
    });
  }

  /**
   * Transición a estado "deleted".
   */
  static toDeleted(manager: ITrackingStateManagerInternal): void {
    this.applyTransition(manager, (m) => {
      m.setDeleted(true);
    });
  }
}
