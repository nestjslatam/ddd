/**
 * Represents a broken rule in the domain.
 */
export class BrokenRule {
  /**
   * Creates a new instance of the BrokenRule class.
   * @param code The code or identifier of the broken rule.
   * @param description The description of the broken rule.
   */
  constructor(
    public code: string | number,
    public description: string,
  ) {
    this.code = code;
    this.description = description;
  }
}
