import { Observable } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { ICommand, Saga } from '@nestjslatam/ddd-lib';

import { SingerCreatedDomainEvent } from './../../domain/domain-events';

@Injectable()
export class SystemSagas {
  @Saga()
  systemCreated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(SingerCreatedDomainEvent),
      map((event) => new DropAncientItemCommand(event.heroId, fakeItemID)),
    );
  }
}