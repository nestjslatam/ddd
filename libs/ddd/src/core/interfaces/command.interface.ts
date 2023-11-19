import { ICommandMetadata } from './command-metadata.interface';

export interface ICommand {
  readonly metadata: ICommandMetadata;
}
