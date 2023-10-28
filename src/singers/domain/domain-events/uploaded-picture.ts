import { DomainEvent } from '@nestjslatam/ddd-lib';

import { TrackingContextService } from '../../../context/app-tracking.context';

export class UploadedPictureEvent extends DomainEvent {
  constructor(readonly singerId: string, readonly newUrlPath: string) {
    super({
      aggregateId: singerId,
      eventName: UploadedPictureEvent.name,
      data: JSON.stringify({ singerId, newUrlPath }),
      metadata: {
        aggregateId: singerId,
        trackingId: TrackingContextService.getTrackingId(),
        timestamp: Date.now(),
        ocurredOn: new Date(),
      },
    });
  }
  toPlain() {
    return {
      singerId: this.singerId,
      newUrlPath: this.newUrlPath,
    };
  }
}
