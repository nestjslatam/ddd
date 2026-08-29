import {
  ArgumentNullException,
  InvalidStateTransitionException,
  NoTransitionsDefinedException,
} from './exceptions/domain.exception';

/**
 * Function to compare two states for equality.
 *
 * **The argument order is part of the contract.** The manager always invokes
 * the comparator as `(definedState, queryState)`:
 *
 * - `definedState` is a state that lives in the transition graph — a source
 *   key, or a declared target. When the manager walks its own graph, it is the
 *   state that was seen first.
 * - `queryState` is the state being looked up: the one the caller passed in,
 *   or the candidate being tested against what is already known.
 *
 * The order only matters for asymmetric comparators — wildcards, subtype or
 * pattern matching, where `f(a, b) !== f(b, a)` — but for those it decides the
 * answer. Read it as: *does this state declared in the graph accept that
 * incoming state?* Symmetric comparators (the common `a.id === b.id` shape,
 * and the reference-equality default) are unaffected.
 *
 * @template TState The type of state being compared
 * @param definedState The state as declared in the transition graph
 * @param queryState The state being looked up or tested
 */
export type StateEqualityComparator<TState> = (
  definedState: TState,
  queryState: TState,
) => boolean;

/**
 * Manages state transitions with validation rules.
 * Implements State Machine pattern for aggregate state management.
 *
 * @template TState - The type representing states (e.g., enum, value object)
 *
 * @example
 * ```typescript
 * // States must be objects: `TState extends object`, so a TypeScript `enum`
 * // does NOT satisfy the constraint -- its members are strings or numbers.
 * // Model the states as a class of constants instead.
 * class OrderStatus {
 *   static readonly Draft = new OrderStatus('DRAFT');
 *   static readonly Pending = new OrderStatus('PENDING');
 *   static readonly Confirmed = new OrderStatus('CONFIRMED');
 *   static readonly Shipped = new OrderStatus('SHIPPED');
 *
 *   private constructor(public readonly name: string) {}
 * }
 *
 * const manager = new StateTransitionManager<OrderStatus>();
 * manager.defineTransitions(
 *   new Map<OrderStatus, OrderStatus[]>([
 *     [OrderStatus.Draft, [OrderStatus.Pending]],
 *     [OrderStatus.Pending, [OrderStatus.Confirmed]],
 *     [OrderStatus.Confirmed, [OrderStatus.Shipped]],
 *   ]),
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
 * // Using with custom equality comparator for value objects.
 * // First argument = state declared in the graph, second = state queried.
 * class OrderState {
 *   constructor(public readonly name: string) {}
 * }
 *
 * const comparator = (defined: OrderState, query: OrderState) =>
 *   defined.name === query.name;
 * const manager = new StateTransitionManager<OrderState>(comparator);
 * ```
 */
export class StateTransitionManager<TState extends object> {
  private readonly _validTransitions: Map<TState, TState[]> = new Map();
  private readonly _stateComparator: StateEqualityComparator<TState>;

  /**
   * Creates a new StateTransitionManager.
   * @param stateComparator Optional custom comparator for state equality.
   *                        Always invoked as `(definedState, queryState)` --
   *                        see {@link StateEqualityComparator}.
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
   * The ONLY place the comparator is invoked.
   *
   * Every lookup in this class goes through here so the argument order can
   * never split again: the source-key lookup used to call
   * `comparator(key, currentState)` while the target match called
   * `comparator(newState, target)`, so a single `canTransitionTo` asked an
   * asymmetric comparator two mirror-image questions and got inconsistent
   * answers. Adding a new lookup? Call this, never `_stateComparator`.
   *
   * @param definedState State declared in the transition graph (or seen first)
   * @param queryState State supplied by the caller / candidate being tested
   */
  private matches(definedState: TState, queryState: TState): boolean {
    return this._stateComparator(definedState, queryState);
  }

  /**
   * Finds a state in an array using the configured comparator.
   * @param state The state to find (the query)
   * @param states Array of declared states to search in
   * @returns true if state is found, false otherwise
   */
  private findState(state: TState, states: TState[]): boolean {
    return states.some((declared) => this.matches(declared, state));
  }

  /**
   * Defines the map of allowed state transitions.
   * @param transitions Map of source state to array of allowed target states.
   * @throws {ArgumentNullException} If transitions is null/undefined
   * @throws {Error} If transitions map is empty, contains invalid entries, or
   *                 declares two source states that the comparator considers
   *                 equal (the second would be unreachable)
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

    // Source states already accepted in this batch, used to detect keys that
    // are distinct objects but the same state under the comparator.
    const acceptedSourceStates: TState[] = [];

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

      // A Map keys by identity, so two distinct objects that the comparator
      // considers the same state both survive as entries -- and every lookup
      // stops at the first match, making the second entry dead. Silently
      // dropping half a state machine is worse than refusing to build it.
      const shadowed = acceptedSourceStates.find((accepted) =>
        this.matches(accepted, sourceState),
      );
      if (shadowed) {
        throw new Error(
          `Duplicate source state '${this.getStateName(sourceState)}' in ` +
            `transitions map: two keys compare as equal, so the second entry ` +
            `would never be reachable. Merge their target states into a single entry.`,
        );
      }
      acceptedSourceStates.push(sourceState);
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
      if (this.matches(key, currentState)) {
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
      if (this.matches(key, state)) {
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
      if (this.matches(key, state)) {
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

    // Collect target states, deduplicated by the comparator rather than by
    // object identity: a Set keys on identity, so one logical terminal state
    // reached through three different instances used to be reported three
    // times -- three warnings and three entries in orphanedStates for a single
    // state. Insertion order is preserved, as with the Set it replaces.
    const allTargetStates: TState[] = [];
    this._validTransitions.forEach((targets) => {
      targets.forEach((target) => {
        if (!this.findState(target, allTargetStates)) {
          allTargetStates.push(target);
        }
      });
    });

    // Find orphaned states (targets that have no outgoing transitions)
    allTargetStates.forEach((targetState) => {
      let isOrphaned = true;
      for (const sourceState of allSourceStates) {
        if (this.matches(sourceState, targetState)) {
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
