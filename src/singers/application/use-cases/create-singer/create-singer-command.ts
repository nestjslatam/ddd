import { CommandBase } from '@nestjslatam/ddd-lib';

export class CreateSingerCommand extends CommandBase {
  constructor(
    public readonly fullName: string,
    public readonly picture: string,
    public readonly trackingId?: string,
  ) {
    super({
      metadata: {
        trackingId,
      },
    });
  }
}
