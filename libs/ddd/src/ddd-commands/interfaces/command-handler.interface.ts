import { IDomainCommand } from './command.interface';

/**
 * Represents a handler for a domain command.
 * @template TDomainCommand The type of the domain command.
 * @template TResult The type of the result returned by the handler.
 */
export interface IDomainCommandHandler<
  TDomainCommand extends IDomainCommand = any,
  TResult = any,
> {
  /**
   * Executes the domain command and returns a promise that resolves to the result.
   * @param domainCommand The domain command to be executed.
   * @returns A promise that resolves to the result of the execution.
   */
  execute(domainCommand: TDomainCommand): Promise<TResult>;
}
