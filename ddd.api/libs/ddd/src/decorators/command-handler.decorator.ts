import 'reflect-metadata';
import { v4 } from 'uuid';

import {
  DOMAIN_COMMAND_HANDLER_METADATA,
  DOMAIN_COMMAND_METADATA,
} from './constants';
import { ICommand } from '../core/interfaces';

export const CommandHandler = (
  command: ICommand | (new (...args: any[]) => ICommand),
): ClassDecorator => {
  return (target: object) => {
    if (!Reflect.hasOwnMetadata(DOMAIN_COMMAND_METADATA, command)) {
      Reflect.defineMetadata(DOMAIN_COMMAND_METADATA, { id: v4() }, command);
    }
    Reflect.defineMetadata(DOMAIN_COMMAND_HANDLER_METADATA, command, target);
  };
};
