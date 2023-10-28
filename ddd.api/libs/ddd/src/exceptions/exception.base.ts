import { TrackingContextService } from '../context';

export interface ISerializedException {
  message: string;
  code: string;
  trackingId: string;
  stack?: string;
  cause?: string;
  metadata?: unknown;
}

export abstract class DomainExceptionBase extends Error {
  abstract code: string;

  public readonly trackingId: string;

  constructor(
    readonly message: string,
    readonly cause?: Error,
    readonly metadata?: unknown,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    const ctx = TrackingContextService.getContext();
    this.trackingId = ctx.trackingId;
  }

  /**
   * By default in NodeJS Error objects are not
   * serialized properly when sending plain objects
   * to external processes. This method is a workaround.
   * Keep in mind not to return a stack trace to user when in production.
   * https://iaincollins.medium.com/error-handling-in-javascript-a6172ccdf9af
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
