import { ProjectMember } from './project-members';

export class Project {
  projectMembers: Array<ProjectMember>;

  constructor(
    public readonly projectId: string,
    public readonly teamId: string,
    public readonly name: string,
    public readonly status: string,
  ) {
    this.projectMembers = [];
  }
}
