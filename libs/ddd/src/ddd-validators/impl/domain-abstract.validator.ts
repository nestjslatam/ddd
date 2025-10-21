/**
 * AbstractValidator is an abstract class that provides common validation methods.
 */
export abstract class AbstractValidator {
  /**
   * Checks if the given value is not an object.
   * @param value - The value to check.
   * @returns Returns true if the value is not an object, otherwise returns false.
   */
  static isNotAndObject(value: unknown): boolean {
    return typeof value !== 'object';
  }

  /**
   * Checks if the given value is undefined or null.
   * @param value - The value to check.
   * @returns Returns true if the value is undefined or null, otherwise returns false.
   */
  static isUndefinedOrNull(value: unknown): boolean {
    return typeof value === 'undefined' || value === null;
  }

  /**
   * Checks if the given props object is empty.
   * @param props - The props object to check.
   * @returns Returns true if the props object is empty, otherwise returns false.
   */
  static isEmptyProps(props: unknown): boolean {
    if (this.isUndefinedOrNull(props)) return false;

    if (
      typeof props === 'number' ||
      typeof props === 'boolean' ||
      props instanceof Date
    )
      return false;

    if (
      typeof props === 'undefined' ||
      props === null ||
      (props instanceof Object && !Object.keys(props).length) ||
      props === ''
    )
      return true;

    if (Array.isArray(props)) {
      if (props.length === 0) return true;

      if (props.every((item) => this.isEmptyProps(item))) {
        return true;
      }
    }

    return false;
  }
}
