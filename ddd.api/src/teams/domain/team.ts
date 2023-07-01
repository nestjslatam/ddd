import { TeamMember } from './team-members';

export class Team {
  teamMembers: Array<TeamMember>;

  constructor(public readonly teamId: string, public readonly name: string) {
    this.teamMembers = [];
  }
}
