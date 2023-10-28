import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';
import { Observable, tap } from 'rxjs';

import { TrackingContextService } from './app-tracking.service';

@Injectable()
export class ContextTrackingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    /**
     * Setting an ID in the global context for each request.
     * This ID can be used as correlation id shown in logs
     */
    const trackingId = request?.body?.trackingId ?? uuidv4();

    TrackingContextService.setTrackingId(trackingId);

    return next.handle().pipe(
      tap(() => {
        // Perform cleaning if needed
      }),
    );
  }
}
