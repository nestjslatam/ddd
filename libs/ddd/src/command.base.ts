import { v4 as uuidv4 } from 'uuid';

import { IDomainCommandMetadata, IDomainCommand } from './core/interfaces';
import { DomainArgumentInvalidException } from './exceptions';
import { DomainGuard } from '.';

export type DomainCommandProps<T> = Omit<T, 'id' | 'metadata'> &
  Partial<IDomainCommand>;

export class CommandBase implements IDomainCommand {
  private readonly _id: string;

  readonly metadata: IDomainCommandMetadata;

  constructor(props: DomainCommandProps<unknown>) {
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
