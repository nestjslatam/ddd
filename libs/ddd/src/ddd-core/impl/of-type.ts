import { Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { IDomainEvent } from '../../ddd-events';

/**
 * Filter values depending on their instance type (comparison is made
 * using native `instanceof`).
 *
 * @param types List of types implementing `IDomainEvent`.
 *
 * @return A stream only emitting the filtered instances.
 */
export function ofType<
  TInput extends IDomainEvent,
  TOutput extends IDomainEvent,
>(...types: Type<TOutput>[]) {
  const isInstanceOf = (event: IDomainEvent): event is TOutput =>
    types.some((classType) => event instanceof classType);
  return (source: Observable<TInput>): Observable<TOutput> =>
    source.pipe(filter(isInstanceOf));
}
