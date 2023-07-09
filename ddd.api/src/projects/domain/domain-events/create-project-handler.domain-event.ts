import { DomainEventsHandler, IDomainEventHandler } from '@nestjslatam/ddd';
import { ProjectCreatedDomainEvent } from './created-project.domain-event';

@DomainEventsHandler(ProjectCreatedDomainEvent)
export class ProjectCreatedDomainEventHandler
  implements IDomainEventHandler<ProjectCreatedDomainEvent>
{
  handle(domainEvent: ProjectCreatedDomainEvent) {
    console.log('Project Created Event Handler Executed: ', domainEvent);
  }
}
