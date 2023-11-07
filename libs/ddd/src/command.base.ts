import { v4 as uuidv4 } from 'uuid';

import { ICommandMetadata, ICommand } from './core/interfaces';
import { DomainGuard } from './helpers';
import { DomainArgumentInvalidException } from './exceptions';

export type CommandProps<T> = Omit<T, 'id' | 'metadata'> & Partial<ICommand>;

export class CommandBase implements ICommand {
  /**
   * Command id, in case if we want to save it
   * for auditing purposes and create a correlation/causation chain
   */
  readonly id: string;

  readonly metadata: ICommandMetadata;

  constructor(props: CommandProps<unknown>) {
    if (DomainGuard.isEmpty(props)) {
      throw new DomainArgumentInvalidException(
        'Command props should not be empty',
      );
    }
    this.id = props.id || uuidv4();
    this.metadata = {
      id: props?.metadata?.id || this.id,
      trackingId: props?.metadata?.trackingId,
    };
  }
}
