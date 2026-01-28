import { DddValueObject } from '../valueobject';
export declare class NumberValueObject extends DddValueObject<number> {
    private readonly options;
    protected constructor(value: number, options?: Partial<NumberValueObjectOptions>);
    static create(value: number, options?: Partial<NumberValueObjectOptions>): NumberValueObject;
    static load(value: number, options?: Partial<NumberValueObjectOptions>): NumberValueObject;
    static zero(options?: Partial<NumberValueObjectOptions>): NumberValueObject;
    static one(options?: Partial<NumberValueObjectOptions>): NumberValueObject;
    isZero(): boolean;
    isPositive(): boolean;
    isNegative(): boolean;
    toNumber(): number;
    toString(): string;
    toJSON(): number;
    protected getEqualityComponents(): Iterable<any>;
    addValidators(): void;
}
export interface NumberValueObjectOptions {
    requirePositive: boolean;
    allowZero: boolean;
    allowNaN: boolean;
    allowInfinity: boolean;
    epsilon: number;
}
//# sourceMappingURL=number.valueobject.d.ts.map