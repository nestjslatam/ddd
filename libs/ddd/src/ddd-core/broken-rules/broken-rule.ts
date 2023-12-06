export class BrokenRule {
  constructor(
    public code: string | number,
    public description: string,
  ) {
    this.code = code;
    this.description = description;
  }
}
