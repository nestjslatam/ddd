import 'reflect-metadata';
import { v4 } from 'uuid';

import { IDomainCommand } from '../interfaces';
import {
  DDD_COMMAND_HANDLER_METADATA,
  DDD_COMMAND_METADATA,
} from './domain-constants';

export const DomainCommandHandler = (
  domainCommand: IDomainCommand,
): ClassDecorator => {
  if (domainCommand === undefined || null) return;

  return (target: object) => {
    if (!Reflect.hasMetadata(DDD_COMMAND_METADATA, domainCommand)) {
      Reflect.defineMetadata(DDD_COMMAND_METADATA, { id: v4() }, domainCommand);
    }
    Reflect.defineMetadata(DDD_COMMAND_HANDLER_METADATA, domainCommand, target);
  };
};
