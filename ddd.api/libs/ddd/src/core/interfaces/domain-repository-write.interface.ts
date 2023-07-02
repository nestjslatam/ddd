export interface IDomainWriteRepository<TKey, TTable> {
  save(item: TTable): Promise<void>;
  delete(id: TKey): Promise<void>;
}
