import { ProjectCreatedDomainEventHandler } from './create-project-handler.domain-event';

export * from './created-project.domain-event';

export const DomainEventHandlers = [ProjectCreatedDomainEventHandler];
