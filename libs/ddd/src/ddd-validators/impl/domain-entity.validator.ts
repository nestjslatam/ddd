import { DomainEntity } from '../../ddd-core/ddd-base-classes';
import { AbstractValidator } from './domain-abstract.validator';

/**
 * Validates if an object is an instance of DomainEntity.
 */
export class DomainValidator extends AbstractValidator {
  /**
   * Checks if the given object is an instance of DomainEntity.
   * @param obj - The object to be checked.
   * @returns True if the object is an instance of DomainEntity, false otherwise.
   */
  static isInstanceof(obj: unknown): obj is DomainEntity<unknown> {
    return obj instanceof DomainEntity;
  }
}
