export interface IDomainReadRepository<TKey, TTable> {
  find(): Promise<TTable[]>;
  findById(id: TKey): Promise<TTable>;
}
