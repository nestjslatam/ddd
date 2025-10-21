import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { MetaRequestContextService } from './meta-context-request.service';
import { MetaRequestHelper } from './meta-request.helper';

@Injectable()
export class MetaRequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Always generate a new requestId per each call
    MetaRequestContextService.setRequestId(uuidv4());

    const { requestId, trackingId, user } =
      MetaRequestHelper.getMetadata(context);

    MetaRequestContextService.setTrackingId(trackingId);
    MetaRequestContextService.setRequestId(requestId);
    MetaRequestContextService.setUser(user);

    return next.handle().pipe(
      tap(() => {
        // Perform cleaning if needed
      }),
    );
  }
}
