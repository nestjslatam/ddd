export class Member {
  constructor(
    public readonly memberId: string,
    public readonly fullName: string,
    public readonly emailAddress: string,
    public readonly phone: string,
  ) {}
}
