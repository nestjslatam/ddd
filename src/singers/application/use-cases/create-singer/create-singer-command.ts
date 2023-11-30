import { ICommand } from '@nestjs/cqrs';

export class CreateSingerCommand implements ICommand {
  constructor(
    public readonly fullName: string,
    public readonly picture: string,
    public readonly trackingId?: string,
  ) {}
}
