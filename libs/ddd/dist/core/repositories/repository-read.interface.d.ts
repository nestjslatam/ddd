import { DddAggregateRoot } from '../../aggregate-root';
import { Primitives } from '../tracking-state';
export interface IDomainReadRepository<
  TKey extends Primitives,
  TDomain extends DddAggregateRoot<any, any>,
> {
  find(): Promise<TDomain[]>;
  findById(id: TKey): Promise<TDomain>;
}
//# sourceMappingURL=repository-read.interface.d.ts.map
