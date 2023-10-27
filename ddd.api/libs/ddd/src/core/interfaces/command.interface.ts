import { ICommandMetadata } from './command-metadata.interface';

export interface ICommand {
  readonly id: string;
  readonly metadata: ICommandMetadata;
}
