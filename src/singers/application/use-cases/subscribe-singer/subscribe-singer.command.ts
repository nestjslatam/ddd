import { CommandBase } from '@nestjslatam/ddd-lib';

export class SubscribeSingerCommand extends CommandBase {
  constructor(
    public readonly singerId: string,
    public readonly subscribedOn: Date,
    public readonly trackingId?: string,
  ) {
    super({
      metadata: {
        trackingId,
      },
    });
  }
}
