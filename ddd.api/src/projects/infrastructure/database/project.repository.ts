import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IProjectRepository, Project } from '../../domain';
import { ProjectTable } from './tables';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(
    @InjectRepository(ProjectTable)
    private readonly repository: Repository<ProjectTable>,
  ) {}

  async save(item: Project): Promise<void> {
    const { projectId, name } = item.getPropsCopy();

    try {
      const table = new ProjectTable();

      table.projectId = projectId.unpack();
      table.name = name.unpack();

      await this.repository.save(table);
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      throw error;
    }
  }
}
