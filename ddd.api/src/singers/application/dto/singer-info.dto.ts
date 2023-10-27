export class SingerInfoDto {
  constructor(
    public id: string,
    public fullName: string,
    public picture: string,
    public registerDate: Date,
    public isSubscribed: boolean,
    public subscribedDate: Date,
    public status: string,
  ) {}
}
