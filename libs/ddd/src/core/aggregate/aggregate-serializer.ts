import { IdValueObject } from '../../valueobjects';
import { TrackingStateManager } from '../../tracking-state-manager';
import { TrackingProps } from '../tracking-state';

/**
 * Handles serialization of aggregates to various formats.
 * Separates serialization concerns from the aggregate root.
 *
 * @template TProps The type of aggregate properties
 *
 * @remarks
 * This class provides different serialization strategies:
 * - Plain objects (for APIs, persistence)
 * - Full objects (for debugging)
 * - Frozen copies (for immutable snapshots)
 *
 * @example
 * ```typescript
 * const serializer = new AggregateSerializer(id, props, trackingState, isValidFn);
 * const plain = serializer.toPlainObject();
 * const full = serializer.toFullObject(brokenRules);
 * ```
 */
export class AggregateSerializer<TProps> {
  private readonly id: IdValueObject;
  private readonly props: TProps;
  private readonly version: number;
  private readonly trackingState: TrackingStateManager;
  private readonly isValidFn: () => boolean;

  /**
   * Creates a new serializer.
   *
   * @param id The aggregate's identity
   * @param props The aggregate's properties
   * @param version The aggregate's version number
   * @param trackingState The tracking state manager
   * @param isValidFn Function to check validation status
   */
  constructor(
    id: IdValueObject,
    props: TProps,
    version: number,
    trackingState: TrackingStateManager,
    isValidFn: () => boolean,
  ) {
    this.id = id;
    this.props = props;
    this.version = version;
    this.trackingState = trackingState;
    this.isValidFn = isValidFn;
  }

  /**
   * Converts to a plain object suitable for serialization.
   * Excludes manager instances that don't serialize well.
   *
   * @returns A serializable object
   */
  public toPlainObject(): {
    id: IdValueObject;
    version: number;
    isValid: boolean;
  } & TProps {
    return {
      id: this.id,
      version: this.version,
      ...this.props,
      isValid: this.isValidFn(),
    };
  }

  /**
   * Converts to a full object including managers.
   * Use for debugging or internal operations, not for serialization.
   *
   * @param brokenRules The broken rules manager to include
   * @returns An object with all entity properties including managers
   */
  public toFullObject(brokenRules: any): {
    id: IdValueObject;
    trackingState: TrackingStateManager;
    brokenRules: any;
    isValid: boolean;
  } & TProps {
    return {
      id: this.id,
      ...this.props,
      trackingState: this.trackingState,
      brokenRules: brokenRules,
      isValid: this.isValidFn(),
    };
  }

  /**
   * Gets a frozen (immutable) copy of the aggregate's properties.
   * Includes ID, props, and tracking state information.
   *
   * @returns An immutable object containing the aggregate's state
   */
  public getFrozenCopy(): Readonly<
    TProps & { id: IdValueObject; props: TProps; trackingState: TrackingProps }
  > {
    return Object.freeze({
      props: this.props,
      id: this.id,
      trackingState: this.trackingState.trackingProps,
    } as Readonly<
      TProps & {
        id: IdValueObject;
        props: TProps;
        trackingState: TrackingProps;
      }
    >);
  }
}
