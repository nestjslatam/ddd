import { CommandBase } from '@nestjslatam/ddd-lib';

export class ChangeFullNameSingerCommand extends CommandBase {
  constructor(
    public readonly singerId: string,
    public readonly newFullName: string,
    public readonly trackingId?: string,
  ) {
    super({
      metadata: {
        trackingId,
      },
    });
  }
}
