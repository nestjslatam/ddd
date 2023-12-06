import { IDomainCommandMetadata } from './command-metadata.interface';

export interface IDomainCommand {
  readonly metadata: IDomainCommandMetadata;
}
