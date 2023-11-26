export interface IDomainReadRepository<TKey, TDomain> {
  find(): Promise<TDomain[]>;
  findById(id: TKey): Promise<TDomain>;
}
