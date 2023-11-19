import { CommandBase } from '@nestjslatam/ddd-lib';

export class UploadPictureSingerCommand extends CommandBase {
  constructor(
    public readonly singerId: string,
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
