import { ITrackingStateTransitions } from '../interfaces/itracking-state-transitions';

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
    manager: ITrackingStateTransitions,
    stateUpdate: (manager: ITrackingStateTransitions) => void,
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
  static toDirty(manager: ITrackingStateTransitions): void {
    this.applyTransition(manager, (m) => {
      m.setDirty(true);
    });
  }

  /**
   * Transición a estado "new".
   */
  static toNew(manager: ITrackingStateTransitions): void {
    this.applyTransition(manager, (m) => {
      m.setNew(true);
    });
  }

  /**
   * Transición a estado "selfDeleted".
   */
  static toSelfDeleted(manager: ITrackingStateTransitions): void {
    this.applyTransition(manager, (m) => {
      m.setSelfDeleted(true);
    });
  }

  /**
   * Transición a estado "deleted".
   */
  static toDeleted(manager: ITrackingStateTransitions): void {
    this.applyTransition(manager, (m) => {
      m.setDeleted(true);
    });
  }
}
