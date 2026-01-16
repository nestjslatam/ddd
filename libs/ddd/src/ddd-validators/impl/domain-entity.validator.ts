import { DomainEntity } from '../../ddd-entity';
import { DomainAbstractValidator } from './domain-abstract.validator';

/**
 * Validador para entidades de dominio.
 */
export class DomainEntityValidator extends DomainAbstractValidator {
  validate(obj: unknown): boolean {
    return obj instanceof DomainEntity;
  }
}
