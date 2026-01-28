import { BrokenRule } from '../../business-rules';
export type ClassType<T = any> = new (...args: any[]) => T;
export interface IRuleValidator {
    getValidatorDescriptor(): ClassType;
    getSubjectDescriptor(): ClassType;
    validate(): ReadonlyArray<BrokenRule>;
}
//# sourceMappingURL=irule-validator.d.ts.map