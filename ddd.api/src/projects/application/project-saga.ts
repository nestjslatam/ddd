import { Injectable } from '@nestjs/common';
import { ICommand } from '@nestjslatam/ddd';
import { ofType } from '@nestjslatam/ddd/core/operators';
import { Saga } from '@nestjslatam/ddd/decorators';
import { Observable, delay, map } from 'rxjs';
import { ProjectCreatedDomainEvent } from '../domain';

@Injectable()
export class ProjectSaga {
  @Saga()
  projectCreated = (event$: Observable<any>): Observable<ICommand> => {
    return event$.pipe(
      ofType(ProjectCreatedDomainEvent),
      delay(1000),
      map((event) => {
        console.log(
          'Create command from Project Created Event executed :',
          event,
        );
        return null;
      }),
    );
  };
}
