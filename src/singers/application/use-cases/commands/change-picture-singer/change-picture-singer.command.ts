import { ICommand } from '@nestjs/cqrs';

export class ChangePictureSingerCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly newPicture: string,
    public readonly trackingId?: string,
  ) {}
}
