export declare abstract class DomainException extends Error {
    constructor(message: string);
}
export declare class ArgumentNullException extends DomainException {
    constructor(parameterName: string);
}
export declare class InvalidOperationException extends DomainException {
    constructor(message: string);
}
export declare class InvalidStateTransitionException extends DomainException {
    constructor(fromState: string, toState: string);
}
export declare class NoTransitionsDefinedException extends DomainException {
    constructor(stateName: string);
}
export declare class InvalidFormatException extends DomainException {
    constructor(parameterName: string, expectedFormat: string, value?: string);
}
//# sourceMappingURL=domain.exception.d.ts.map