import { ICommand } from '@nestjs/cqrs';

export class RemoveSongToSingerCommand implements ICommand {
  constructor(
    public readonly singerId: string,
    public readonly songId: string,
    public readonly trackingId?: string,
  ) {}
}
