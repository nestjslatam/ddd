export interface IDomainWriteRepository<TKey, TDomain> {
  insert(entity: TDomain): Promise<void>;
  insertBatch(entities: TDomain[]): Promise<void>;
  update(id: TKey, entity: TDomain): Promise<void>;
  delete(id: TKey): Promise<void>;
}
