import { ICommand } from '@nestjs/cqrs';

export class AddSongToSingerCommand implements ICommand {
  constructor(
    public readonly singerId: string,
    public readonly songName: string,
    public readonly trackingId?: string,
  ) {}
}
