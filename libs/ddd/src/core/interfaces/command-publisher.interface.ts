import { IDomainCommand } from './command.interface';

export interface IDomainCommandPublisher<
  DomainCommandBase extends IDomainCommand = IDomainCommand,
> {
  publish<T extends DomainCommandBase = DomainCommandBase>(command: T): any;
}
