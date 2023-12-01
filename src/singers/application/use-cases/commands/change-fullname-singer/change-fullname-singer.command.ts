import { ICommand } from '@nestjs/cqrs';

export class ChangeFullNameSingerCommand implements ICommand {
  constructor(
    public readonly singerId: string,
    public readonly newFullName: string,
    public readonly trackingId?: string,
  ) {}
}
