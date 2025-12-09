import { Type } from '@nestjs/common';
import { DOMAIN_COMMAND_HANDLER_METADATA, DOMAIN_COMMAND_METADATA } from '.';
import { DomainCommandHandlerNotFoundException } from '../ddd-exceptions';
import {
  IDomainCommand,
  IDomainCommandMetadata,
} from '../ddd-commands/interfaces';
import { CommandHandlerType } from '../ddd-commands';

/**
 * Helper class for reflecting on domain commands.
 */
export class ReflectCommandHelper {
  /**
   * Reflects the command id from the command handler.
   *
   * @param handler - The command handler.
   *
   * @returns The command id.
   */
  static getCommandId(command: IDomainCommand): string {
    const commandType = command.constructor;

    const commandMetadata: IDomainCommandMetadata = Reflect.getMetadata(
      DOMAIN_COMMAND_METADATA,
      commandType,
    ) as IDomainCommandMetadata;

    if (!commandMetadata) {
      throw new DomainCommandHandlerNotFoundException(commandType.name);
    }

    return commandMetadata.id;
  }

  /**
   * Reflects the command id from the command handler.
   *
   * @param handler - The command handler.
   *
   * @returns The command id.
   */
  static reflectCommandId(handler: CommandHandlerType): string | undefined {
    const command: Type<IDomainCommand> = Reflect.getMetadata(
      DOMAIN_COMMAND_HANDLER_METADATA,
      handler,
    ) as Type<IDomainCommand>;

    if (!command) {
      throw new DomainCommandHandlerNotFoundException(handler.name);
    }

    const commandMetadata: IDomainCommandMetadata = Reflect.getMetadata(
      DOMAIN_COMMAND_METADATA,
      command,
    ) as IDomainCommandMetadata;

    return commandMetadata.id;
  }
}
