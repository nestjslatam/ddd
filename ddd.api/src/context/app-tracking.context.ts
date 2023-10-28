import { Injectable } from '@nestjs/common';
import { RequestContext } from 'nestjs-request-context';

// TODO: Add database transaction connection
export class AppTrackingContext extends RequestContext {
  trackingId: string;
  //transactionConnection?: DatabaseTransactionConnection; // For global transactions
}

@Injectable()
export class TrackingContextService {
  static getContext(): AppTrackingContext {
    const ctx: AppTrackingContext = RequestContext.currentContext.req;
    return ctx;
  }

  static setTrackingId(id: string): void {
    const ctx = this.getContext();
    ctx.trackingId = id;
  }

  static getTrackingId(): string {
    return this.getContext().trackingId;
  }

  // static getTransactionConnection(): DatabaseTransactionConnection | undefined {
  //   const ctx = this.getContext();
  //   return ctx.transactionConnection;
  // }

  // static setTransactionConnection(
  //   transactionConnection?: DatabaseTransactionConnection,
  // ): void {
  //   const ctx = this.getContext();
  //   ctx.transactionConnection = transactionConnection;
  // }

  // static cleanTransactionConnection(): void {
  //   const ctx = this.getContext();
  //   ctx.transactionConnection = undefined;
  // }
}
