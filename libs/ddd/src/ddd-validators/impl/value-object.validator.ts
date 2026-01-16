import { ValueObject } from '../../ddd-valueobject';

/**
 * Validador de utilidad para objetos de valor.
 */
export class ValueObjectValidator {
  /**
   * Verifica si un objeto es un ValueObject.
   */
  static isValueObject(obj: unknown): obj is ValueObject<any> {
    return obj instanceof ValueObject;
  }
}
