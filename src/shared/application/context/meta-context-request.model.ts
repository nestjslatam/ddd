import { RequestContext } from 'nestjs-request-context';

export interface IMetaRequestContext {
  trackingId?: string;
  requestId: string;
  user: string;
}

export class MetaRequestContext
  extends RequestContext
  implements IMetaRequestContext
{
  trackingId?: string;
  requestId: string;
  user: string;
}
