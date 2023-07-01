import { DomainEvent } from '@nestjslatam/ddd';

export class ProjectCreatedDomainEvent extends DomainEvent {
  constructor(public readonly projectId: string, public readonly name: string) {
    super({ aggregateId: projectId, eventName: 'ProjectCreated' });
  }
}
