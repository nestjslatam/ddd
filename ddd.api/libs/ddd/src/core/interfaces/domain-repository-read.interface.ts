import { Paginated, PaginatedQueryParams } from '../../pagination.base';

export interface IDomainReadRepository<TKey, TTable> {
  fetchAll(): Promise<TTable[]>;
  fetchById(id: TKey): Promise<TTable>;
  fetchAllPaginated(params: PaginatedQueryParams): Promise<Paginated<TTable>>;
}
