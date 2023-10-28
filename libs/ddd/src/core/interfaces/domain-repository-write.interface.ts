export interface IDomainWriteRepository<TTable> {
  insert(entity: TTable | TTable[]): Promise<void>;
  delete(entity: TTable): Promise<void>;
}
