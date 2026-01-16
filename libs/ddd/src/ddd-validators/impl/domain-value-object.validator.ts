import { ValueObject } from '../../ddd-valueobject';
import { DomainAbstractValidator } from './domain-abstract.validator';

/**
 * Validador para objetos de valor de dominio.
 */
export class DomainValueObjectValidator extends DomainAbstractValidator {
  validate(obj: unknown): boolean {
    return obj instanceof ValueObject;
  }
}
