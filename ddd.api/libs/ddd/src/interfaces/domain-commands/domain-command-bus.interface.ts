import { IDomainCommand } from './domain-command.interface';

export interface IDomainCommandBus<
  TDomainCommand extends IDomainCommand = IDomainCommand,
> {
  execute(domainCommand: TDomainCommand): Promise<void>;
}
