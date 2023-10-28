import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { DomainExceptionBase } from '../../exceptions';
import { TrackingContextService } from '../../context';

export class DomainExceptionInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger(DomainExceptionInterceptor.name);

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<DomainExceptionBase> {
    return next.handle().pipe(
      catchError((err) => {
        // Logging for debugging purposes
        if (err.status >= 400 && err.status < 500) {
          this.logger.debug(
            `[${TrackingContextService.getTrackingId()}] ${err.message}`,
          );

          const isClassValidatorError =
            Array.isArray(err?.response?.message) &&
            typeof err?.response?.error === 'string' &&
            err.status === 400;
          // Transforming class-validator errors to a different format
          if (isClassValidatorError) {
            err = new BadRequestException({
              statusCode: err.status,
              message: 'Validation error',
              error: err?.response?.error,
              subErrors: err?.response?.message,
              correlationId: TrackingContextService.getTrackingId(),
            });
          }
        }

        // Adding request ID to error message
        if (!err.correlationId) {
          err.correlationId = TrackingContextService.getTrackingId();
        }

        if (err.response) {
          err.response.correlationId = err.correlationId;
        }

        return throwError(err);
      }),
    );
  }
}
