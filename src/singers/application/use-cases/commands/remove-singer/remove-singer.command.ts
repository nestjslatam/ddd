import { ICommand } from '@nestjs/cqrs';

export class RemoveSingerCommand implements ICommand {
  constructor(
    public readonly singerId: string,
    public readonly trackingId?: string,
  ) {}
}
