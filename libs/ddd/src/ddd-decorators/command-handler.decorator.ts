import 'reflect-metadata';
import { v4 } from 'uuid';

import {
  DOMAIN_COMMAND_HANDLER_METADATA,
  DOMAIN_COMMAND_METADATA,
} from './constants';
import { IDomainCommand } from '../ddd-commands';

export const DomainCommandHandler = (
  command: IDomainCommand | (new (...args: any[]) => IDomainCommand),
): ClassDecorator => {
  return (target: object) => {
    if (!Reflect.hasOwnMetadata(DOMAIN_COMMAND_METADATA, command)) {
      Reflect.defineMetadata(DOMAIN_COMMAND_METADATA, { id: v4() }, command);
    }
    Reflect.defineMetadata(DOMAIN_COMMAND_HANDLER_METADATA, command, target);
  };
};
