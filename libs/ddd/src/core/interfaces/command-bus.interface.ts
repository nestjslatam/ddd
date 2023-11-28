import { IDomainCommand } from './command.interface';

export interface IDomainCommandBus<
  DomainCommandBase extends IDomainCommand = IDomainCommand,
> {
  execute<T extends DomainCommandBase, R = any>(domainCommand: T): Promise<R>;
}
