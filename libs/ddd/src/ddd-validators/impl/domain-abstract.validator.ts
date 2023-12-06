export abstract class AbstractValidator {
  static isNotAndObject(value: unknown): boolean {
    return typeof value !== 'object';
  }

  static isUndefinedOrNull(value: unknown): boolean {
    return typeof value === 'undefined' || value === null;
  }

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
