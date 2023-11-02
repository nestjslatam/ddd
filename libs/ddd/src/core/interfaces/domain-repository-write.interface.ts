export interface IDomainWriteRepository<TKey, TTable> {
  add(entity: TTable): Promise<void>;
  addBatch(entities: TTable[]): Promise<void>;
  update(id: TKey, entity: TTable): Promise<void>;
  delete(id: TKey): Promise<void>;
}
