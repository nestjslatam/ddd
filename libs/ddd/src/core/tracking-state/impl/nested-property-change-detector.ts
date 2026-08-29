import {
  IChangeDetector,
  ITrackingProps,
  ITrackingStateManager,
} from '../interfaces';

/**
 * Detecta cambios en propiedades anidadas que contienen instancias de TrackingStateManager.
 * Implementa el patrón Strategy para la detección de cambios.
 */
export class NestedPropertyChangeDetector implements IChangeDetector {
  /**
   * Property names under which a child may expose its tracking state, in
   * lookup order.
   *
   * WHY two names: `trackingState` is the only one this library ever produces
   * -- both DddValueObject (own property) and DddAggregateRoot (getter) expose
   * their TrackingStateManager under that name. Until 3.0.x this detector
   * looked exclusively for `Tracking`, a name carried over from the C# port
   * that nothing in the library defines, so nested change detection never once
   * fired for an object built with @nestjslatam/ddd-lib. `Tracking` is kept as
   * a fallback because hand-rolled props objects out there already use it.
   */
  private static readonly TrackingKeyNames: readonly string[] = [
    'trackingState',
    'Tracking',
  ];

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
   * Reads the tracking state a child property carries, if any.
   *
   * Only the four boolean flags are read, never the markAs* methods, so a
   * child may expose either a live ITrackingStateManager or a plain
   * ITrackingProps snapshot (what `DddAggregateRoot.toObject()` produces).
   *
   * @param value The child property value to inspect.
   * @returns The child's tracking flags, or undefined when it carries none.
   */
  private readChildTracking(
    value: unknown,
  ): Partial<ITrackingProps> | undefined {
    if (value === null || typeof value !== 'object') {
      return undefined;
    }

    const child = value as Record<string, unknown>;

    for (const key of NestedPropertyChangeDetector.TrackingKeyNames) {
      const candidate = child[key];

      if (candidate && typeof candidate === 'object') {
        return candidate as Partial<ITrackingProps>;
      }
    }

    return undefined;
  }

  /**
   * Detecta cambios en las propiedades especificadas.
   * Itera sobre las propiedades y busca instancias de TrackingStateManager anidadas.
   *
   * @remarks
   * Precedence when several children are tracked, from weakest to strongest:
   * `new` < `dirty` < `selfDeleted` < `deleted`. Exactly one flag survives,
   * because every markAs* transition on the manager clears the other three.
   */
  detectChanges<TProp>(
    props: TProp,
    trackingStateManager: ITrackingStateManager,
  ): ITrackingStateManager {
    this.validateProps(props);

    // Reseteamos el estado antes de detectar cambios
    trackingStateManager.markAsClean();

    // The flags are collected across ALL children first and only then applied.
    // WHY: markAs* is a mutually exclusive transition, so applying it inside
    // the loop (what this did until 3.0.x) let the LAST child seen win, and
    // "last" is Object.keys order -- a dirty child silently lost its flag to a
    // `new` sibling that happened to be declared after it.
    const aggregated: ITrackingProps = {
      isDirty: false,
      isNew: false,
      isSelfDeleted: false,
      isDeleted: false,
    };

    // Iteramos por las propiedades del objeto
    Object.keys(props).forEach((key) => {
      const childTracking = this.readChildTracking(
        (props as Record<string, unknown>)[key],
      );

      if (!childTracking) {
        return;
      }

      aggregated.isNew = aggregated.isNew || childTracking.isNew === true;
      aggregated.isDirty = aggregated.isDirty || childTracking.isDirty === true;
      aggregated.isSelfDeleted =
        aggregated.isSelfDeleted || childTracking.isSelfDeleted === true;
      aggregated.isDeleted =
        aggregated.isDeleted || childTracking.isDeleted === true;
    });

    // Applied weakest first so the strongest transition is the one left
    // standing. WHY this ranking:
    //  - a removal (deleted, then selfDeleted) must never be masked by a
    //    sibling that is merely modified: skipping it would leave orphan rows;
    //  - dirty outranks new because it is the safe reading of the parent. A
    //    child being new proves the parent CHANGED, never that the parent
    //    itself was never persisted, and treating an existing parent as new
    //    makes the repository insert it again.
    if (aggregated.isNew) trackingStateManager.markAsNew();
    if (aggregated.isDirty) trackingStateManager.markAsDirty();
    if (aggregated.isSelfDeleted) trackingStateManager.markAsSelfDeleted();
    if (aggregated.isDeleted) trackingStateManager.markAsDeleted();

    return trackingStateManager;
  }
}
