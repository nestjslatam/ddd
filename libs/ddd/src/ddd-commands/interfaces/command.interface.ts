import { IDomainCommandMetadata } from './command-metadata.interface';

/**
 * Represents a domain command.
 */
export interface IDomainCommand {
  /**
   * The metadata associated with the command.
   */
  readonly metadata: IDomainCommandMetadata;
}
