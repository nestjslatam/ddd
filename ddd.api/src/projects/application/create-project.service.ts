import { Injectable } from '@nestjs/common';
import { DomainEventPublisher } from '@nestjslatam/ddd';

import { Project } from '../domain/project.domain';
import { ProjectRepository } from '../infrastructure';
import { ProjectName } from '../domain';

@Injectable()
export class CreateProjectService {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async create(name: string): Promise<void> {
    const project = Project.create(ProjectName.create(name));

    if (!project.getIsValid())
      throw new Error(project.getBrokenRules().join('\n'));

    this.repository.save(project);

    const projectMerged = this.eventPublisher.mergeObjectContext(project);

    projectMerged.commit();
  }
}
