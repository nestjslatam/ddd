"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidFormatException = exports.NoTransitionsDefinedException = exports.InvalidStateTransitionException = exports.InvalidOperationException = exports.ArgumentNullException = exports.DomainException = void 0;
class DomainException extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.DomainException = DomainException;
class ArgumentNullException extends DomainException {
    constructor(parameterName) {
        super(`${parameterName} cannot be null or undefined`);
    }
}
exports.ArgumentNullException = ArgumentNullException;
class InvalidOperationException extends DomainException {
    constructor(message) {
        super(message);
    }
}
exports.InvalidOperationException = InvalidOperationException;
class InvalidStateTransitionException extends DomainException {
    constructor(fromState, toState) {
        super(`Invalid state transition from '${fromState}' to '${toState}'. ` +
            `This transition is not defined in the valid transitions map.`);
    }
}
exports.InvalidStateTransitionException = InvalidStateTransitionException;
class NoTransitionsDefinedException extends DomainException {
    constructor(stateName) {
        super(`No transitions defined for state '${stateName}'. ` +
            `Define transitions first using defineTransitions().`);
    }
}
exports.NoTransitionsDefinedException = NoTransitionsDefinedException;
class InvalidFormatException extends DomainException {
    constructor(parameterName, expectedFormat, value) {
        const valueInfo = value ? ` Provided value: '${value}'` : '';
        super(`${parameterName} has an invalid format. Expected: ${expectedFormat}.${valueInfo}`);
    }
}
exports.InvalidFormatException = InvalidFormatException;
//# sourceMappingURL=domain.exception.js.map