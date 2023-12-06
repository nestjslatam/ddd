import { DomainEntity } from '../../ddd-entity';
import { AbstractValidator } from './domain-abstract.validator';

export class DomainValidator extends AbstractValidator {
  static isInstanceof(obj: unknown): obj is DomainEntity<unknown> {
    return obj instanceof DomainEntity;
  }
}
