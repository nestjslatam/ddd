import { DddValueObject } from '../valueobject';
export declare class StringValueObject extends DddValueObject<string> {
    private readonly options;
    protected constructor(value: string, options?: Partial<StringValueObjectOptions>);
    static create(value: string, options?: Partial<StringValueObjectOptions>): StringValueObject;
    static load(value: string, options?: Partial<StringValueObjectOptions>): StringValueObject;
    static empty(options?: Partial<StringValueObjectOptions>): StringValueObject;
    isEmpty(): boolean;
    get length(): number;
    toUpperCase(): string;
    toLowerCase(): string;
    trim(): string;
    contains(substring: string): boolean;
    startsWith(prefix: string): boolean;
    endsWith(suffix: string): boolean;
    toString(): string;
    toJSON(): string;
    protected getEqualityComponents(): Iterable<any>;
    addValidators(): void;
}
export interface StringValueObjectOptions {
    allowEmpty: boolean;
    trimWhitespace: boolean;
    minLength: number;
    maxLength: number;
}
//# sourceMappingURL=string.valueobject.d.ts.map