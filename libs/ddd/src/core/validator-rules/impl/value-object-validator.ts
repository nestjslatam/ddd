import { DddValueObject } from '../../../valueobject';
import { AbstractValidator } from './abstract-validator';

/**
 * Validador para objetos de valor de dominio.
 */
export class ValueObjectValidator extends AbstractValidator {
  validate(obj: unknown): boolean {
    return obj instanceof DddValueObject;
  }

  static isValueObject(obj: unknown): obj is DddValueObject<any> {
    return obj instanceof DddValueObject;
  }
}
