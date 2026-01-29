import { BrokenRule } from './core';
export interface IBrokenRulesManager {
    getBrokenRules(): ReadonlyArray<BrokenRule>;
}
export declare class BrokenRulesManager implements IBrokenRulesManager {
    private _brokenRules;
    private static readonly BROKEN_RULES_PROPERTY_NAME;
    add(brokenRule: BrokenRule): void;
    addRange(brokenRules: ReadonlyArray<BrokenRule>): void;
    remove(brokenRule: BrokenRule): void;
    clear(): void;
    getBrokenRules(): ReadonlyArray<BrokenRule>;
    hasErrors(): boolean;
    getBrokenRulesAsString(): string;
    static getPropertiesBrokenRules<T extends object>(instance: T, properties: Array<keyof T>): ReadonlyArray<BrokenRule>;
    private validateNotNull;
    private exists;
    private isSameRule;
    private static extractBrokenRulesManager;
}
//# sourceMappingURL=broken-rules.manager.d.ts.map