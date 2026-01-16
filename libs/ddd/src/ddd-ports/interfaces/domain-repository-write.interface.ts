import { DomainAggregateRoot } from '../../ddd-aggregate-root';
import { DomainEntity } from '../../ddd-entity';
import { Primitives } from '../../ddd-core';

export interface IDomainWriteRepository<
  TKey extends Primitives,
  TDomain extends DomainAggregateRoot<any, any> | DomainEntity<any, any>,
> {
  /**
   * Inserts a single entity into the repository.
   *
   * @param entity - The entity to be inserted.
   * @returns A promise that resolves when the operation is complete.
   */
  insert(entity: TDomain): Promise<void>;

  /**
   * Inserts multiple entities into the repository.
   *
   * @param entities - The entities to be inserted.
   * @returns A promise that resolves when the operation is complete.
   */
  insertBatch(entities: TDomain[]): Promise<void>;

  /**
   * Updates an entity in the repository.
   *
   * @param id - The identifier of the entity to be updated.
   * @param entity - The updated entity.
   * @returns A promise that resolves when the operation is complete.
   */
  update(id: TKey, entity: TDomain): Promise<void>;

  /**
   * Deletes an entity from the repository.
   *
   * @param id - The identifier of the entity to be deleted.
   * @returns A promise that resolves when the operation is complete.
   */
  delete(id: TKey): Promise<void>;
}
