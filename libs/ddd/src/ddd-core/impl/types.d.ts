/* eslint-disable @typescript-eslint/ban-types */
/**
 * Type of a class.
 */
export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}
