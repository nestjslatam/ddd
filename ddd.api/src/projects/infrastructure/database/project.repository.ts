import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IProjectRepository, Project } from '../../domain';
import { MemberTable, ProjectTable } from './tables';
import { Audit } from './tables/audit.entity';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(
    @InjectRepository(ProjectTable)
    private readonly repository: Repository<ProjectTable>,
  ) {}

  async save(item: Project): Promise<void> {
    const { name, status } = item.getPropsCopy();

    const { createdBy, createdAt, updatedBy, updatedAt } = item
      .getAudit()
      .unpack();

    const members: Array<MemberTable> = [];

    try {
      const table = new ProjectTable();

      item.getMembers()?.map((member) => {
        const { id, firstName, lastName } = member.unpack();

        const m = new MemberTable();
        m.memberId = id;
        m.firstName = firstName;
        m.lastName = lastName;
        m.status = 'active';
        m.audit = new Audit();

        m.audit.createdBy = createdBy;
        m.audit.createdAt = createdAt;
        m.audit.updatedBy = updatedBy;
        m.audit.updatedAt = updatedAt;

        members.push(m);
      });

      table.projectId = item.getId();
      table.name = name.unpack();
      table.status = status;
      table.members = members;
      table.audit = new Audit();

      table.audit.createdBy = createdBy;
      table.audit.createdAt = createdAt;
      table.audit.updatedBy = updatedBy;
      table.audit.updatedAt = updatedAt;

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
