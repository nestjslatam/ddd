import { Injectable } from '@nestjs/common';
import { DomainEventPublisher } from '@nestjslatam/ddd';

import { Project } from '../domain/project.domain';
import { ProjectRepository } from '../infrastructure';
import { ProjectName } from '../domain';
import { Result } from '../../shared/application';

@Injectable()
export class CreateProjectService {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async create(name: string): Promise<Result> {
    const project = Project.create(ProjectName.create(name));

    if (!project.getIsValid())
      return Result.fail(project.getBrokenRulesAsString());

    await this.repository.save(project);

    const projectMerged = this.eventPublisher.mergeObjectContext(project);

    projectMerged.commit();

    return Result.ok(JSON.stringify(project));
  }
}
