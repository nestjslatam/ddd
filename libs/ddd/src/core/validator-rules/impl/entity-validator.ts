import { DddAggregateRoot } from '../../../aggregate-root';
import { AbstractValidator } from './abstract-validator';

/**
 * Validador para entidades de dominio.
 */
export class EntityValidator extends AbstractValidator {
  validate(obj: unknown): boolean {
    return obj instanceof DddAggregateRoot;
  }
}
