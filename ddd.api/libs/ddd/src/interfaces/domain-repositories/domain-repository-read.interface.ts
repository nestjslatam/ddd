export interface IDomainReadRepository<TKey, TTable> {
  fetchAll(): Promise<TTable[]>;
  fetchById(id: TKey): Promise<TTable>;
}
