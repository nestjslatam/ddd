"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateTransitionManager = void 0;
const domain_exception_1 = require("./exceptions/domain.exception");
class StateTransitionManager {
    constructor(stateComparator) {
        this._validTransitions = new Map();
        this._stateComparator = stateComparator || ((s1, s2) => s1 === s2);
    }
    getStateName(state) {
        if (!state)
            return 'null/undefined';
        if (typeof state.toString === 'function') {
            const str = state.toString();
            if (str !== '[object Object]')
                return str;
        }
        if ('name' in state && typeof state.name === 'string') {
            return state.name;
        }
        if ('value' in state) {
            return String(state.value);
        }
        return state.constructor?.name || 'Unknown State';
    }
    findState(state, states) {
        return states.some((s) => this._stateComparator(state, s));
    }
    defineTransitions(transitions) {
        if (!transitions) {
            throw new domain_exception_1.ArgumentNullException('transitions');
        }
        if (transitions.size === 0) {
            throw new Error('Transitions map cannot be empty. Provide at least one state transition.');
        }
        transitions.forEach((targetStates, sourceState) => {
            if (!sourceState) {
                throw new domain_exception_1.ArgumentNullException('sourceState in transitions map');
            }
            if (!targetStates) {
                throw new domain_exception_1.ArgumentNullException(`targetStates for state '${this.getStateName(sourceState)}'`);
            }
            if (!Array.isArray(targetStates)) {
                throw new Error(`Target states for '${this.getStateName(sourceState)}' must be an array`);
            }
            if (targetStates.length === 0) {
                throw new Error(`Target states array for '${this.getStateName(sourceState)}' cannot be empty. ` +
                    `Remove the entry if no transitions are allowed from this state.`);
            }
            targetStates.forEach((targetState, index) => {
                if (!targetState) {
                    throw new domain_exception_1.ArgumentNullException(`targetState at index ${index} for source state '${this.getStateName(sourceState)}'`);
                }
            });
        });
        this._validTransitions.clear();
        transitions.forEach((value, key) => {
            this._validTransitions.set(key, [...value]);
        });
    }
    canTransitionTo(currentState, newState) {
        if (!currentState) {
            throw new domain_exception_1.ArgumentNullException('currentState');
        }
        if (!newState) {
            throw new domain_exception_1.ArgumentNullException('newState');
        }
        let foundKey;
        for (const key of this._validTransitions.keys()) {
            if (this._stateComparator(key, currentState)) {
                foundKey = key;
                break;
            }
        }
        if (!foundKey) {
            throw new domain_exception_1.NoTransitionsDefinedException(this.getStateName(currentState));
        }
        const possibleTransitions = this._validTransitions.get(foundKey);
        return possibleTransitions
            ? this.findState(newState, possibleTransitions)
            : false;
    }
    getValidTransitions(state) {
        if (!state) {
            throw new domain_exception_1.ArgumentNullException('state');
        }
        for (const [key, value] of this._validTransitions.entries()) {
            if (this._stateComparator(key, state)) {
                return [...value];
            }
        }
        return [];
    }
    hasTransitions() {
        return this._validTransitions.size > 0;
    }
    hasTransitionsDefined(state) {
        if (!state) {
            throw new domain_exception_1.ArgumentNullException('state');
        }
        for (const key of this._validTransitions.keys()) {
            if (this._stateComparator(key, state)) {
                return true;
            }
        }
        return false;
    }
    getAllStates() {
        return Array.from(this._validTransitions.keys());
    }
    getTransitionGraph() {
        const graph = {};
        this._validTransitions.forEach((targets, source) => {
            const sourceName = this.getStateName(source);
            graph[sourceName] = targets.map((t) => this.getStateName(t));
        });
        return graph;
    }
    validateTransitionGraph() {
        const warnings = [];
        const orphanedStates = [];
        const allSourceStates = new Set(this._validTransitions.keys());
        const allTargetStates = new Set();
        this._validTransitions.forEach((targets) => {
            targets.forEach((target) => allTargetStates.add(target));
        });
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
                warnings.push(`State '${this.getStateName(targetState)}' is a transition target but has no outgoing transitions defined. ` +
                    `This might be intentional for terminal states.`);
            }
        });
        return {
            isValid: true,
            warnings,
            orphanedStates,
        };
    }
    clear() {
        this._validTransitions.clear();
    }
    validateTransition(currentState, newState) {
        if (!currentState) {
            throw new domain_exception_1.ArgumentNullException('currentState');
        }
        if (!newState) {
            throw new domain_exception_1.ArgumentNullException('newState');
        }
        if (!this.canTransitionTo(currentState, newState)) {
            throw new domain_exception_1.InvalidStateTransitionException(this.getStateName(currentState), this.getStateName(newState));
        }
    }
}
exports.StateTransitionManager = StateTransitionManager;
//# sourceMappingURL=state-transition.manager.js.map