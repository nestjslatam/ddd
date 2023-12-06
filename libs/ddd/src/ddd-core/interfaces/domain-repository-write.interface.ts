export interface IDomainWriteRepository<TKey, TTable> {
  insert(entity: TTable): Promise<void>;
  insertBatch(entities: TTable[]): Promise<void>;
  update(id: TKey, entity: TTable): Promise<void>;
  delete(id: TKey): Promise<void>;
}
