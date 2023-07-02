import {
  BrokenRule,
  DateTimeHelper,
  DomainAggregateRoot,
  DomainAuditValueObject,
} from '@nestjslatam/ddd';

import { ProjectMember } from './project-member';
import { ProjectId } from './project-id';
import { Name } from './name';
import { ProjectCreatedDomainEvent } from './domain-events';

interface IProjectProps {
  projectId: ProjectId;
  name: Name;
}

export class Project extends DomainAggregateRoot<IProjectProps> {
  private readonly _projectMembers?: Array<ProjectMember>;

  constructor(props: IProjectProps) {
    super({
      id: ProjectId.create(),
      props,
      audit: DomainAuditValueObject.create('todo', DateTimeHelper.getUtcDate()),
    });
  }

  static create(name: Name): Project {
    const id = ProjectId.create();

    const project = new Project({
      projectId: id,
      name,
    });

    project.addDomainEvent(
      new ProjectCreatedDomainEvent(id.unpack(), name.unpack()),
    );

    return project;
  }

  isOrphan(): boolean {
    return this._projectMembers.length === 0;
  }

  addMember(member: ProjectMember): Project {
    if (this._projectMembers.includes(member))
      this.addBrokenRule(new BrokenRule('Member', 'Member already exists'));

    this._projectMembers.push(member);

    return this;
  }

  updateMemberRole(member: ProjectMember, role: string): Project {
    const index = this._projectMembers.indexOf(member);

    if (index === -1)
      this.addBrokenRule(new BrokenRule('Member', 'Member does not exists'));

    this._projectMembers[index].unpack().role = role;

    return this;
  }

  removeMember(member: ProjectMember): Project {
    const index = this._projectMembers.indexOf(member);

    if (index === -1)
      this.addBrokenRule(new BrokenRule('Member', 'Member does not exists'));

    this._projectMembers.splice(index, 1);

    return this;
  }

  protected businessRules(props: IProjectProps): void {
    const { name } = props;

    if (name.unpack().toLowerCase() === 'default') {
      this.addBrokenRule(
        new BrokenRule(
          this.constructor.name,
          'Invalid Name. The value should be different from "default"',
        ),
      );
    }
  }
}
