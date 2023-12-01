import { ICommand } from '@nestjs/cqrs';

export class SubscribeSingerCommand implements ICommand {
  constructor(
    public readonly singerId: string,
    public readonly trackingId?: string,
  ) {}
}
