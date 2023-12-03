import { ICommand } from '@nestjs/cqrs';

export class ChangeFullNameSingerCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly newFullName: string,
    public readonly trackingId?: string,
  ) {}
}
