/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/**
 * Type of a class.
 */
export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}
