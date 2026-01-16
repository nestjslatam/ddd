import {
  IChangeDetector,
  ITrackingStateManager,
} from '@nestjslatam/ddd-lib/ddd-managers';

/**
 * Detecta cambios en propiedades anidadas que contienen instancias de TrackingStateManager.
 * Implementa el patrón Strategy para la detección de cambios.
 */
export class NestedPropertyChangeDetector implements IChangeDetector {
  private static readonly TrackingKeyName = 'Tracking';

  /**
   * Valida que las propiedades no sean nulas.
   * @param props Las propiedades a validar.
   * @throws Error si props es null o undefined.
   */
  private validateProps<TProp>(props: TProp): void {
    if (!props) {
      throw new Error('ArgumentNullException: props cannot be null');
    }
  }

  /**
   * Detecta cambios en las propiedades especificadas.
   * Itera sobre las propiedades y busca instancias de TrackingStateManager anidadas.
   */
  detectChanges<TProp>(
    props: TProp,
    trackingStateManager: ITrackingStateManager,
  ): ITrackingStateManager {
    this.validateProps(props);

    // Reseteamos el estado antes de detectar cambios
    trackingStateManager.markAsClean();

    // Iteramos por las propiedades del objeto
    Object.keys(props).forEach((key) => {
      const value = props[key];

      if (value !== null && typeof value === 'object') {
        // Buscamos si el objeto hijo tiene la propiedad "Tracking"
        const trackingValue = value[
          NestedPropertyChangeDetector.TrackingKeyName
        ] as ITrackingStateManager;

        if (trackingValue) {
          // Aplicamos el estado más prioritario encontrado
          if (trackingValue.isDirty) trackingStateManager.markAsDirty();
          if (trackingValue.isNew) trackingStateManager.markAsNew();
          if (trackingValue.isSelfDeleted)
            trackingStateManager.markAsSelfDeleted();
          if (trackingValue.isDeleted) trackingStateManager.markAsDeleted();
        }
      }
    });

    return trackingStateManager;
  }
}
