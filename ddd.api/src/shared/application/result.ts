export class Result {
  constructor(
    public readonly isSuccess: boolean,
    public readonly error: string,
    public readonly payload: string,
  ) {
    this.isSuccess = isSuccess;
    this.error = error;
    this.payload = payload;
  }

  static ok(payload: any) {
    return new Result(true, null, payload);
  }

  static fail(error: any) {
    return new Result(false, error, null);
  }

  get isFailure() {
    return !this.isSuccess;
  }

  toString() {
    return `Result - ${this.isSuccess ? 'SUCCESS' : 'FAILURE'}\n${
      this.isSuccess ? this.payload : this.error
    }`;
  }
}
