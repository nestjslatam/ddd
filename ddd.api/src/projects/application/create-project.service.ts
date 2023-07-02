import { Injectable } from '@nestjs/common';
import { Project } from '../domain/project';
import { Name } from '../domain/name';
import { ProjectRepository } from '../infrastructure';

@Injectable()
export class CreateProjectService {
  constructor(private readonly repository: ProjectRepository) {}

  async create(name: string): string {
    const project = Project.create(Name.create(name));

    await this.repository.save(project);

    project.commit();

    return name;
  }
}
