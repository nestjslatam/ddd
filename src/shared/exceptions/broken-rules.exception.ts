import { BrokenRule } from '@nestjslatam/ddd-lib';

/**
 * Raised when an aggregate or value object failed its own invariants.
 *
 * This library collects broken rules rather than throwing, so a factory has
 * to check `isValid` and decide what to do. Throwing a plain `Error` there --
 * which is what this sample did -- loses two things: the structure of the
 * rules, and the fact that this is the caller's mistake rather than the
 * server's. Every rejected request came back as `500 Internal server error`
 * with no indication of which rule failed.
 *
 * Carrying the rules through means `DomainExceptionFilter` can answer with a
 * 422 and name them.
 */
export class BrokenRulesException extends Error {
  constructor(
    /** What was being built or changed, e.g. `Product`. */
    public readonly subject: string,
    public readonly brokenRules: readonly BrokenRule[],
  ) {
    super(
      `${subject} is invalid: ${brokenRules
        .map((rule) => `${rule.property}: ${rule.message}`)
        .join(', ')}`,
    );
    this.name = 'BrokenRulesException';
  }
}
