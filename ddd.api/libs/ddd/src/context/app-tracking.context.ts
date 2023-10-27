import { RequestContext } from 'nestjs-request-context';
import { TrackingContextService } from './app-tracking.service';

/**
 * Setting some isolated context for each request.
 */

// TODO: Add database transaction connection
export class AppTrackingContext extends RequestContext {
  trackingId: string;
  //transactionConnection?: DatabaseTransactionConnection; // For global transactions

  constructor(private readonly trackingContextService: TrackingContextService) {
    super(
      TrackingContextService.getContext().req,
      TrackingContextService.getContext().res,
    );
  }
}
