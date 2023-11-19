import { Observable, map } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { Saga, ofType } from '@nestjslatam/ddd-lib';

import { SingerCreatedDomainEvent } from './../../domain/domain-events';

/*
Sagas#
Saga is a long-running process that listens to events and may trigger new commands. It is usually used to manage complex workflows in the application. For example, when a user signs up, a saga may listen to the UserRegisteredEvent and send a welcome email to the user.
Sagas are an extremely powerful feature. A single saga may listen for 1..* events. Using the RxJS library, we can filter, map, fork, and merge event streams to create sophisticated workflows. Each saga returns an Observable which produces a command instance. This command is then dispatched asynchronously by the CommandBus.
*/
@Injectable()
export class SystemSagas {
  @Saga()
  systemCreated = (events$: Observable<any>): Observable<void> => {
    return events$.pipe(
      ofType(SingerCreatedDomainEvent),
      map((event) => console.log('Singer created listened from SAGA: ', event)),
    );
  };
}
