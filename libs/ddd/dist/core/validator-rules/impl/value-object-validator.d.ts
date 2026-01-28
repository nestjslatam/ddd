import { DddValueObject } from '../../../valueobject';
import { AbstractValidator } from './abstract-validator';
export declare class ValueObjectValidator extends AbstractValidator {
    validate(obj: unknown): boolean;
    static isValueObject(obj: unknown): obj is DddValueObject<any>;
}
//# sourceMappingURL=value-object-validator.d.ts.map