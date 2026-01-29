import {
  ArgumentNullException,
  InvalidStateTransitionException,
  NoTransitionsDefinedException,
} from './exceptions/domain.exception';

/**
 * Function to compare two states for equality.
 * @template TState The type of state being compared
 */
export type StateEqualityComparator<TState> = (
  state1: TState,
  state2: TState,
) => boolean;

/**
 * Manages state transitions with validation rules.
 * Implements State Machine pattern for aggregate state management.
 *
 * @template TState - The type representing states (e.g., enum, value object)
 *
 * @example
 * ```typescript
 * // Using with enum states
 * enum OrderStatus {
 *   Draft = 'DRAFT',
 *   Pending = 'PENDING',
 *   Confirmed = 'CONFIRMED',
 *   Shipped = 'SHIPPED'
 * }
 *
 * const manager = new StateTransitionManager<OrderStatus>();
 * manager.defineTransitions(
 *   new Map([
 *     [OrderStatus.Draft, [OrderStatus.Pending]],
 *     [OrderStatus.Pending, [OrderStatus.Confirmed]],
 *     [OrderStatus.Confirmed, [OrderStatus.Shipped]]
 *   ])
 * );
 *
 * // Check if transition is valid
 * if (manager.canTransitionTo(OrderStatus.Draft, OrderStatus.Pending)) {
 *   // Perform transition
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using with custom equality comparator for value objects
 * class OrderState {
 *   constructor(public readonly name: string) {}
 * }
 *
 * const comparator = (s1: OrderState, s2: OrderState) => s1.name === s2.name;
 * const manager = new StateTransitionManager<OrderState>(comparator);
 * ```
 */
export class StateTransitionManager<TState extends object> {
  private readonly _validTransitions: Map<TState, TState[]> = new Map();
  private readonly _stateComparator: StateEqualityComparator<TState>;

  /**
   * Creates a new StateTransitionManager.
   * @param stateComparator Optional custom comparator for state equality.
   *                        Defaults to reference equality (===).
   */
  constructor(stateComparator?: StateEqualityComparator<TState>) {
    this._stateComparator = stateComparator || ((s1, s2) => s1 === s2);
  }

  /**
   * Extracts a human-readable name from a state object.
   * @param state The state to extract name from
   * @returns String representation of the state
   */
  private getStateName(state: TState): string {
    if (!state) return 'null/undefined';

    // Try toString() first
    if (typeof (state as any).toString === 'function') {
      const str = (state as any).toString();
      if (str !== '[object Object]') return str;
    }

    // Try name property
    if ('name' in state && typeof (state as any).name === 'string') {
      return (state as any).name;
    }

    // Try value property (common in enums/value objects)
    if ('value' in state) {
      return String((state as any).value);
    }

    // Fall back to constructor name
    return (state as any).constructor?.name || 'Unknown State';
  }

  /**
   * Finds a state in an array using the configured comparator.
   * @param state The state to find
   * @param states Array of states to search in
   * @returns true if state is found, false otherwise
   */
  private findState(state: TState, states: TState[]): boolean {
    return states.some((s) => this._stateComparator(state, s));
  }

  /**
   * Defines the map of allowed state transitions.
   * @param transitions Map of source state to array of allowed target states.
   * @throws {ArgumentNullException} If transitions is null/undefined
   * @throws {Error} If transitions map is empty or contains invalid entries
   *
   * @example
   * ```typescript
   * manager.defineTransitions(
   *   new Map([
   *     [State.Draft, [State.Active]],
   *     [State.Active, [State.Completed, State.Cancelled]]
   *   ])
   * );
   * ```
   */
  public defineTransitions(transitions: Map<TState, TState[]>): void {
    if (!transitions) {
      throw new ArgumentNullException('transitions');
    }

    if (transitions.size === 0) {
      throw new Error(
        'Transitions map cannot be empty. Provide at least one state transition.',
      );
    }

    // Validate each transition entry
    transitions.forEach((targetStates, sourceState) => {
      if (!sourceState) {
        throw new ArgumentNullException('sourceState in transitions map');
      }

      if (!targetStates) {
        throw new ArgumentNullException(
          `targetStates for state '${this.getStateName(sourceState)}'`,
        );
      }

      if (!Array.isArray(targetStates)) {
        throw new Error(
          `Target states for '${this.getStateName(
            sourceState,
          )}' must be an array`,
        );
      }

      if (targetStates.length === 0) {
        throw new Error(
          `Target states array for '${this.getStateName(
            sourceState,
          )}' cannot be empty. ` +
            `Remove the entry if no transitions are allowed from this state.`,
        );
      }

      // Validate each target state is not null
      targetStates.forEach((targetState, index) => {
        if (!targetState) {
          throw new ArgumentNullException(
            `targetState at index ${index} for source state '${this.getStateName(
              sourceState,
            )}'`,
          );
        }
      });
    });

    this._validTransitions.clear();

    // Copy transitions to internal map with defensive copying
    transitions.forEach((value, key) => {
      this._validTransitions.set(key, [...value]);
    });
  }

  /**
   * Verifies if transition from current state to new state is valid.
   * @param currentState The current state
   * @param newState The target state
   * @returns true if transition is allowed, false otherwise
   * @throws {ArgumentNullException} If currentState or newState is null/undefined
   * @throws {NoTransitionsDefinedException} If no transitions defined for current state
   *
   * @example
   * ```typescript
   * if (manager.canTransitionTo(currentState, targetState)) {
   *   // Safe to transition
   *   aggregate.transitionTo(targetState);
   * } else {
   *   throw new Error('Invalid transition');
   * }
   * ```
   */
  public canTransitionTo(currentState: TState, newState: TState): boolean {
    if (!currentState) {
      throw new ArgumentNullException('currentState');
    }

    if (!newState) {
      throw new ArgumentNullException('newState');
    }

    // Find current state using comparator
    let foundKey: TState | undefined;
    for (const key of this._validTransitions.keys()) {
      if (this._stateComparator(key, currentState)) {
        foundKey = key;
        break;
      }
    }

    if (!foundKey) {
      throw new NoTransitionsDefinedException(this.getStateName(currentState));
    }

    const possibleTransitions = this._validTransitions.get(foundKey);
    return possibleTransitions
      ? this.findState(newState, possibleTransitions)
      : false;
  }

  /**
   * Gets all valid transitions from a given state.
   * @param state The state to get transitions for
   * @returns Readonly array of valid target states, or empty array if none defined
   * @throws {ArgumentNullException} If state is null/undefined
   *
   * @example
   * ```typescript
   * const validTargets = manager.getValidTransitions(currentState);
   * console.log(`Can transition to: ${validTargets.map(s => s.name).join(', ')}`);
   * ```
   */
  public getValidTransitions(state: TState): readonly TState[] {
    if (!state) {
      throw new ArgumentNullException('state');
    }

    // Find state using comparator
    for (const [key, value] of this._validTransitions.entries()) {
      if (this._stateComparator(key, state)) {
        return [...value]; // Return defensive copy
      }
    }

    return [];
  }

  /**
   * Checks if any transitions are defined.
   * @returns true if transitions are defined, false otherwise
   */
  public hasTransitions(): boolean {
    return this._validTransitions.size > 0;
  }

  /**
   * Checks if a specific state has any transitions defined.
   * @param state The state to check
   * @returns true if state has defined transitions, false otherwise
   * @throws {ArgumentNullException} If state is null/undefined
   */
  public hasTransitionsDefined(state: TState): boolean {
    if (!state) {
      throw new ArgumentNullException('state');
    }

    for (const key of this._validTransitions.keys()) {
      if (this._stateComparator(key, state)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Gets all states that have transitions defined.
   * @returns Readonly array of all source states in the transition map
   */
  public getAllStates(): readonly TState[] {
    return Array.from(this._validTransitions.keys());
  }

  /**
   * Gets the complete transition graph as a plain object for inspection/debugging.
   * @returns Object representing the transition graph
   *
   * @example
   * ```typescript
   * const graph = manager.getTransitionGraph();
   * console.log('Transition Graph:', JSON.stringify(graph, null, 2));
   * ```
   */
  public getTransitionGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {};

    this._validTransitions.forEach((targets, source) => {
      const sourceName = this.getStateName(source);
      graph[sourceName] = targets.map((t) => this.getStateName(t));
    });

    return graph;
  }

  /**
   * Validates the integrity of the entire transition graph.
   * Checks for orphaned states and provides warnings.
   * @returns Object with validation results
   *
   * @example
   * ```typescript
   * const validation = manager.validateTransitionGraph();
   * if (!validation.isValid) {
   *   console.warn('Transition graph issues:', validation.warnings);
   * }
   * ```
   */
  public validateTransitionGraph(): {
    isValid: boolean;
    warnings: string[];
    orphanedStates: TState[];
  } {
    const warnings: string[] = [];
    const orphanedStates: TState[] = [];
    const allSourceStates = new Set(this._validTransitions.keys());
    const allTargetStates = new Set<TState>();

    // Collect all target states
    this._validTransitions.forEach((targets) => {
      targets.forEach((target) => allTargetStates.add(target));
    });

    // Find orphaned states (targets that have no outgoing transitions)
    allTargetStates.forEach((targetState) => {
      let isOrphaned = true;
      for (const sourceState of allSourceStates) {
        if (this._stateComparator(targetState, sourceState)) {
          isOrphaned = false;
          break;
        }
      }

      if (isOrphaned) {
        orphanedStates.push(targetState);
        warnings.push(
          `State '${this.getStateName(
            targetState,
          )}' is a transition target but has no outgoing transitions defined. ` +
            `This might be intentional for terminal states.`,
        );
      }
    });

    return {
      isValid: true, // Graph is technically valid even with orphans
      warnings,
      orphanedStates,
    };
  }

  /**
   * Clears all defined transitions.
   * Use with caution - this will remove all state transition rules.
   */
  public clear(): void {
    this._validTransitions.clear();
  }

  /**
   * Verifies if a transition is valid and throws detailed exception if not.
   * @param currentState The current state
   * @param newState The target state
   * @throws {ArgumentNullException} If states are null/undefined
   * @throws {NoTransitionsDefinedException} If no transitions defined for current state
   * @throws {InvalidStateTransitionException} If transition is not allowed
   *
   * @example
   * ```typescript
   * try {
   *   manager.validateTransition(currentState, newState);
   *   // Transition is valid, proceed
   * } catch (error) {
   *   // Handle specific transition error
   * }
   * ```
   */
  public validateTransition(currentState: TState, newState: TState): void {
    if (!currentState) {
      throw new ArgumentNullException('currentState');
    }

    if (!newState) {
      throw new ArgumentNullException('newState');
    }

    if (!this.canTransitionTo(currentState, newState)) {
      throw new InvalidStateTransitionException(
        this.getStateName(currentState),
        this.getStateName(newState),
      );
    }
  }
}
