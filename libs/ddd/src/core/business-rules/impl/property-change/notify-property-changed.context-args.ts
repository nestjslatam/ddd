export class NotifyPropertyChangedContextArgs {
  public handled: boolean = false;

  constructor(
    public readonly previousValue: any,
    public readonly newValue: any,
  ) {}
}
