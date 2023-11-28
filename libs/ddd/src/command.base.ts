import { v4 as uuidv4 } from 'uuid';

import { ICommandMetadata, ICommand } from './core/interfaces';
import { DomainArgumentInvalidException } from './exceptions';
import { DomainGuard } from '.';

export type CommandProps<T> = Omit<T, 'id' | 'metadata'> & Partial<ICommand>;

export class CommandBase implements ICommand {
  private readonly _id: string;

  readonly metadata: ICommandMetadata;

  constructor(props: CommandProps<unknown>) {
    if (DomainGuard.isEmpty(props)) {
      throw new DomainArgumentInvalidException(
        'Command props should not be empty',
      );
    }

    this._id = uuidv4();

    this.metadata = {
      id: this._id,
      trackingId: props?.metadata?.trackingId,
    };
  }
}
