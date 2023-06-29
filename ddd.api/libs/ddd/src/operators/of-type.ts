import { Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { DomainEvent } from '../domaint-event';

export function ofDomainEventType<
  TInput extends DomainEvent,
  TOutput extends DomainEvent,
>(...types: Type<TOutput>[]) {
  if (!types) return;

  const isInstanceOf = (domainEvent: DomainEvent): domainEvent is TOutput =>
    !!types.find((classType) => domainEvent instanceof classType);
  return (source: Observable<TInput>): Observable<TOutput> =>
    source.pipe(filter(isInstanceOf));
}
