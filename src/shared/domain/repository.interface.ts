export interface IRepository<TEntity, TTable> {
  findOneById(id: string): Promise<TTable>;
  create(entity: TEntity): Promise<void>;
  update(id: string, entity: TEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
