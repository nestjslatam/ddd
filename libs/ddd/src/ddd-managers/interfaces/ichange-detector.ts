import { ITrackingStateManager } from './itracking-state-manager';

/**
 * Define la estructura básica de las propiedades.
 * Equivale a IProps en C#.
 */
export interface IProps {
  [key: string]: any;
}

/**
 * Interfaz para detectar cambios en propiedades de objetos.
 * Permite detectar estados de tracking en propiedades anidadas.
 */
export interface IChangeDetector {
  /**
   * Detecta cambios en las propiedades especificadas y actualiza el estado de tracking.
   * @param props Las propiedades a analizar.
   * @param trackingStateManager El administrador de estado a actualizar.
   * @returns El administrador de estado actualizado.
   */
  detectChanges<TProp extends IProps>(
    props: TProp,
    trackingStateManager: ITrackingStateManager,
  ): ITrackingStateManager;
}
