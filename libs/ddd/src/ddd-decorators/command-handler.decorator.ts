import 'reflect-metadata';
import { v4 } from 'uuid';

import {
  DOMAIN_COMMAND_HANDLER_METADATA,
  DOMAIN_COMMAND_METADATA,
} from './constants';
import { IDomainCommand } from '../ddd-commands';

/**
 * Decorator used to mark a class as a domain command handler.
 * A domain command handler is responsible for handling a specific domain command.
 * It is used in conjunction with the `DomainCommand` decorator.
 *
 * @param command - The domain command that the handler is responsible for.
 *                  It can be either an instance of `IDomainCommand` or a constructor function that implements `IDomainCommand`.
 *
 * @returns A class decorator function.
 */
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
