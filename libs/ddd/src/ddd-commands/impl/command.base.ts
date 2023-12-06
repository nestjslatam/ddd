import { v4 as uuidv4 } from 'uuid';

import { IDomainCommand, IDomainCommandMetadata } from '../interfaces';

export type DomainCommandProps<T> = Omit<T, 'id' | 'metadata'> &
  Partial<IDomainCommand>;

export class CommandBase implements IDomainCommand {
  private readonly _id: string;

  readonly metadata: IDomainCommandMetadata;

  constructor(props: DomainCommandProps<unknown>) {
    this._id = uuidv4();

    this.metadata = {
      id: this._id,
      trackingId: props?.metadata?.trackingId,
    };
  }
}
