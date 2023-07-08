import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IProjectRepository, Project } from '../../domain';
import { MemberTable, ProjectTable } from './tables';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(
    @InjectRepository(ProjectTable)
    private readonly repository: Repository<ProjectTable>,
  ) {}

  async save(item: Project): Promise<void> {
    const { name } = item.getPropsCopy();

    const members: Array<MemberTable> = [];

    try {
      const table = new ProjectTable();

      item.getMembers()?.forEach((member) => {
        const { id, firstName, lastName } = member.unpack();

        const m = new MemberTable();
        m.memberId = id;
        m.firstName = firstName;
        m.lastName = lastName;

        members.push(m);
      });

      table.projectId = item.getId();
      table.name = name.unpack();
      table.members = [...members];

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
