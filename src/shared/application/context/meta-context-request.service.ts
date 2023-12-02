import { RequestContext } from 'nestjs-request-context';
import { MetaRequestContext } from './meta-context-request.model';

export class MetaRequestContextService {
  static getContext(): MetaRequestContext {
    const ctx: MetaRequestContext = RequestContext.currentContext.req;
    return ctx;
  }

  static setTrackingId(value: string): void {
    if (!value || value === undefined)
      throw new Error('TrackingId is required.');

    const ctx = this.getContext();
    ctx.trackingId = value;
  }

  static getTrackingId(): string {
    return this.getContext().trackingId;
  }

  static setRequestId(value: string): void {
    if (!value || value === undefined)
      throw new Error('RequestId is required.');

    const ctx = this.getContext();
    ctx.requestId = value;
  }

  static getRequestId(): string {
    return this.getContext().requestId;
  }

  static setUser(value: string): void {
    if (!value) throw new Error('User data is required.');

    const ctx = this.getContext();
    ctx.user = value;
  }

  static getUser(): string {
    return this.getContext().user;
  }
}
