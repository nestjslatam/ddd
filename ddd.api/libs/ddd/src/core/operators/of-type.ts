import { Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IDomainEvent } from '../interfaces';

export function ofType<
  TInput extends IDomainEvent,
  TOutput extends IDomainEvent,
>(...types: Type<TOutput>[]) {
  const isInstanceOf = (event: IDomainEvent): event is TOutput =>
    !!types.find((classType) => event instanceof classType);
  return (source: Observable<TInput>): Observable<TOutput> =>
    source.pipe(filter(isInstanceOf));
}
