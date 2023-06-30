export class TeamMember {
  constructor(
    public readonly teamMemberId: string,
    public readonly memberId: string,
    public readonly role: string,
    public readonly emailAddress: string,
  ) {}
}
