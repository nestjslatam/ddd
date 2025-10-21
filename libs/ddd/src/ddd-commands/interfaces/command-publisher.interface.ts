import { IDomainCommand } from './command.interface';
/**
 * Represents a publisher for domain commands.
 * @template TDomainCommandBase - The base type for domain commands.
 */
export interface IDomainCommandPublisher<
  TDomainCommandBase extends IDomainCommand = IDomainCommand,
> {
  /**
   * Publishes a domain command.
   * @template T - The specific type of domain command to publish.
   * @param command - The domain command to publish.
   */
  publish<T extends TDomainCommandBase = TDomainCommandBase>(command: T): void;
}
