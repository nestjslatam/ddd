export type StateEqualityComparator<TState> = (
  state1: TState,
  state2: TState,
) => boolean;
export declare class StateTransitionManager<TState extends object> {
  private readonly _validTransitions;
  private readonly _stateComparator;
  constructor(stateComparator?: StateEqualityComparator<TState>);
  private getStateName;
  private findState;
  defineTransitions(transitions: Map<TState, TState[]>): void;
  canTransitionTo(currentState: TState, newState: TState): boolean;
  getValidTransitions(state: TState): readonly TState[];
  hasTransitions(): boolean;
  hasTransitionsDefined(state: TState): boolean;
  getAllStates(): readonly TState[];
  getTransitionGraph(): Record<string, string[]>;
  validateTransitionGraph(): {
    isValid: boolean;
    warnings: string[];
    orphanedStates: TState[];
  };
  clear(): void;
  validateTransition(currentState: TState, newState: TState): void;
}
//# sourceMappingURL=state-transition.manager.d.ts.map
