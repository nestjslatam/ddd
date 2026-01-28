/**
 * Base class for all domain exceptions.
 * Provides a consistent structure for domain-level errors.
 */
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown when an argument is null or undefined when it should not be.
 */
export class ArgumentNullException extends DomainException {
  constructor(parameterName: string) {
    super(`${parameterName} cannot be null or undefined`);
  }
}

/**
 * Thrown when an operation is not valid for the current state of the object.
 */
export class InvalidOperationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when state transition is not allowed.
 */
export class InvalidStateTransitionException extends DomainException {
  constructor(fromState: string, toState: string) {
    super(
      `Invalid state transition from '${fromState}' to '${toState}'. ` +
        `This transition is not defined in the valid transitions map.`,
    );
  }
}

/**
 * Thrown when no transitions are defined for a state.
 */
export class NoTransitionsDefinedException extends DomainException {
  constructor(stateName: string) {
    super(
      `No transitions defined for state '${stateName}'. ` +
        `Define transitions first using defineTransitions().`,
    );
  }
}

/**
 * Thrown when a provided value does not match the expected format.
 */
export class InvalidFormatException extends DomainException {
  constructor(parameterName: string, expectedFormat: string, value?: string) {
    const valueInfo = value ? ` Provided value: '${value}'` : '';
    super(
      `${parameterName} has an invalid format. Expected: ${expectedFormat}.${valueInfo}`,
    );
  }
}
