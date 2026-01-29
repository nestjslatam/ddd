"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DddAggregateRoot = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const broken_rules_manager_1 = require("./broken-rules.manager");
const state_transition_manager_1 = require("./state-transition.manager");
const tracking_state_manager_1 = require("./tracking-state-manager");
const validator_rule_manager_1 = require("./validator-rule.manager");
const valueobjects_1 = require("./valueobjects");
class DddAggregateRoot extends cqrs_1.AggregateRoot {
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }
    get props() {
        return this._props;
    }
    set props(value) {
        this._props = value;
    }
    get version() {
        return this._version;
    }
    set version(value) {
        this._version = value;
    }
    get brokenRules() {
        return this._brokenRulesManager;
    }
    get trackingState() {
        return this._trackingStateManager;
    }
    get validators() {
        return this._validatorRuleManager;
    }
    get propsCopy() {
        return Object.freeze({
            props: this._props,
            id: this.id,
            trackingState: this.trackingState.trackingProps,
        });
    }
    isValid() {
        return this._brokenRulesManager.getBrokenRules().length === 0;
    }
    static createValidated(createFn) {
        const aggregate = createFn();
        aggregate.validate();
        return aggregate;
    }
    constructor(props, options) {
        super();
        this._trackingStateManager =
            options?.trackingStateManager ?? new tracking_state_manager_1.TrackingStateManager();
        this._brokenRulesManager =
            options?.brokenRulesManager ?? new broken_rules_manager_1.BrokenRulesManager();
        this._validatorRuleManager =
            options?.validatorRuleManager ??
                new validator_rule_manager_1.ValidatorRuleManager();
        this._stateTransitionManager = new state_transition_manager_1.StateTransitionManager();
        this.id = options?.id ?? valueobjects_1.IdValueObject.create();
        this._props = props;
        this._guardStrategy = options?.guardStrategy ?? (() => this.guard());
        this._validatorsStrategy =
            options?.validatorsStrategy ?? ((manager) => this.addValidators(manager));
        if (!options?.skipInitialValidation) {
            this.validate();
        }
        this._trackingStateManager.markAsNew();
    }
    validate() {
        this._guardStrategy();
        this._validatorsStrategy(this._validatorRuleManager);
        const entityBrokenRules = this._validatorRuleManager.getBrokenRules();
        if (entityBrokenRules.length > 0) {
            this.brokenRules.addRange(entityBrokenRules);
            this._trackingStateManager.markAsDirty();
        }
        const propBrokenRules = broken_rules_manager_1.BrokenRulesManager.getPropertiesBrokenRules(this, Object.getOwnPropertyNames(Object.getPrototypeOf(this)));
        if (propBrokenRules.length > 0) {
            this.brokenRules.addRange(propBrokenRules);
            this._trackingStateManager.markAsDirty();
        }
    }
    guard() {
    }
    addValidators(_manager) {
    }
    equals(obj) {
        if (obj === null || obj === undefined) {
            return false;
        }
        if (!(obj instanceof DddAggregateRoot)) {
            return false;
        }
        if (this === obj) {
            return true;
        }
        if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(obj)) {
            return false;
        }
        return this.referenceEntityPropertiesEquals(obj);
    }
    referenceEntityPropertiesEquals(obj) {
        const thisId = this.id;
        const otherId = obj.id;
        if (thisId === null ||
            thisId === undefined ||
            otherId === null ||
            otherId === undefined) {
            return false;
        }
        if (typeof thisId.equals === 'function') {
            return thisId.equals(otherId);
        }
        return thisId === otherId;
    }
    static areEqual(left, right) {
        if (left === null || left === undefined) {
            return right === null || right === undefined;
        }
        return left.equals(right);
    }
    static areNotEqual(left, right) {
        return !this.areEqual(left, right);
    }
    toPlainObject() {
        return {
            id: this.id,
            version: this.version,
            ...this._props,
            isValid: this.isValid(),
        };
    }
    toObject() {
        return {
            id: this.id,
            ...this._props,
            trackingState: this.trackingState,
            brokenRules: this.brokenRules,
            isValid: this.isValid(),
        };
    }
    defineValidTransitions(transitions) {
        this._stateTransitionManager.defineTransitions(transitions);
    }
    canTransitionTo(currentState, newState) {
        return this._stateTransitionManager.canTransitionTo(currentState, newState);
    }
}
exports.DddAggregateRoot = DddAggregateRoot;
//# sourceMappingURL=aggregate-root.js.map