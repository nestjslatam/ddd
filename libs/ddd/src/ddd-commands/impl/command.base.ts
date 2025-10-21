/**
 * Represents a base class for domain commands.
 */
import { v4 as uuidv4 } from 'uuid';

import { IDomainCommand, IDomainCommandMetadata } from '../interfaces';

/**
 * Represents the properties of a domain command.
 */
export type DomainCommandProps<T> = Omit<T, 'id' | 'metadata'> &
  Partial<IDomainCommand>;

/**
 * Represents a base class for domain commands.
 */
export class CommandBase implements IDomainCommand {
  private readonly _id: string;

  readonly metadata: IDomainCommandMetadata;

  /**
   * Creates an instance of the CommandBase class.
   * @param props The properties of the domain command.
   */
  constructor(props: DomainCommandProps<unknown>) {
    this._id = uuidv4();

    this.metadata = {
      id: this._id,
      trackingId: props?.metadata?.trackingId,
    };
  }
}
