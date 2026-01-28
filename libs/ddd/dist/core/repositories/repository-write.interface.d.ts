import { DddAggregateRoot } from "../../aggregate-root";
import { Primitives } from "../tracking-state";
export interface IDomainWriteRepository<TKey extends Primitives, TDomain extends DddAggregateRoot<any, any>> {
    insert(entity: TDomain): Promise<void>;
    insertBatch(entities: TDomain[]): Promise<void>;
    update(id: TKey, entity: TDomain): Promise<void>;
    delete(id: TKey): Promise<void>;
}
//# sourceMappingURL=repository-write.interface.d.ts.map