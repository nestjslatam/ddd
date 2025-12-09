/**
 * Represents a serialized exception.
 */
export interface ISerializedException {
  message: string;
  code: string;
  trackingId: string;
  stack?: string;
  cause?: string;
  metadata?: unknown;
}

/**
 * Represents a base class for domain exceptions.
 */
export abstract class DomainExceptionBase extends Error {
  /**
   * The code associated with the exception.
   */
  abstract code: string;

  /**
   * The unique tracking ID for the exception.
   */
  public readonly trackingId: string;

  /**
   * Creates a new instance of the DomainExceptionBase class.
   * @param message The error message.
   * @param cause The cause of the exception.
   * @param metadata Additional metadata associated with the exception.
   */
  constructor(
    readonly message: string,
    readonly cause?: Error,
    readonly metadata?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  /**
   * Converts the exception to a serialized format.
   * @returns The serialized exception object.
   */
  toJSON(): ISerializedException {
    return {
      message: this.message,
      code: this.code,
      stack: this.stack,
      trackingId: this.trackingId,
      cause: JSON.stringify(this.cause),
      metadata: this.metadata,
    };
  }
}
