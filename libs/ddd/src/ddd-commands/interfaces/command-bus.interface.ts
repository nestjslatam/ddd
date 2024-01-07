import { IDomainCommand } from './command.interface';
/**
 * Represents a command bus that executes domain commands.
 *
 * @template TDomainCommandBase - The base type for domain commands.
 */
export interface IDomainCommandBus<
  TDomainCommandBase extends IDomainCommand = IDomainCommand,
> {
  /**
   * Executes a domain command and returns a promise that resolves to the result.
   *
   * @template T - The specific type of the domain command.
   * @template TResult - The type of the result returned by the command execution.
   * @param domainCommand - The domain command to be executed.
   * @returns A promise that resolves to the result of the command execution.
   */
  execute<T extends TDomainCommandBase, TResult = any>(
    domainCommand: T,
  ): Promise<TResult>;
}
