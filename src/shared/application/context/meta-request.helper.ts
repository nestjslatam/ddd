import { ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { v4 as uuidv4 } from 'uuid';
import { IMetaRequestContext } from './meta-context-request.model';

export class MetaRequestHelper {
  static getMetadata(context: ExecutionContext): IMetaRequestContext {
    const metadata: IMetaRequestContext = {
      trackingId: '',
      requestId: '',
      user: '',
    };

    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      // do something that is only important in the context of regular HTTP requests (REST)
      metadata.trackingId = request?.body?.trackingId || '';
      metadata.requestId = request?.body?.requestId || uuidv4();
      metadata.user = request?.body?.user || 'admin';

      // do something that is only important in the context of Microservice requests
      return metadata;
    }

    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const info = gqlContext.getInfo();
      const parentType = info.parentType.name;

      if (parentType === 'Query' || parentType === 'Mutation') {
        metadata.trackingId =
          gqlContext.getContext().req.body?.variables?.trackingId;
        metadata.requestId =
          gqlContext.getContext().req.body?.variables?.requestId;
        metadata.user = gqlContext.getContext().req.body?.variables?.user;

        return metadata;
      }
    }

    // If a trackingId is provided, use it, otherwise generate a new one
    metadata.requestId === undefined || null
      ? (metadata.requestId = uuidv4())
      : (metadata.requestId = metadata.requestId);

    metadata.trackingId === undefined || null
      ? (metadata.trackingId = uuidv4())
      : (metadata.trackingId = metadata.trackingId);

    metadata.user === null
      ? (metadata.user = 'default')
      : (metadata.user = metadata.user);

    return metadata;
  }
}
