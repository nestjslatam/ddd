import { Subject } from 'rxjs';

import { IDomainCommand, IDomainCommandPublisher } from '../interfaces';

/**
 * Default implementation of the IDomainCommandPublisher interface.
 * This class is responsible for publishing domain commands to the subject.
 *
 * @template TDomainCommandBase - The base type for domain commands.
 */
export class DefaultCommandPublisher<TDomainCommandBase extends IDomainCommand>
  implements IDomainCommandPublisher<TDomainCommandBase>
{
  /**
   * Creates an instance of DefaultCommandPublisher.
   *
   * @param subject$ - The subject to which the domain commands will be published.
   */
  constructor(private readonly subject$: Subject<TDomainCommandBase>) {}

  /**
   * Publishes a domain command to the subject.
   *
   * @template T - The specific type of the domain command.
   * @param domainCommand - The domain command to be published.
   */
  publish<T extends TDomainCommandBase>(domainCommand: T): void {
    this.subject$.next(domainCommand);
  }
}
