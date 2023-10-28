/* eslint-disable @typescript-eslint/ban-types */
export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}
