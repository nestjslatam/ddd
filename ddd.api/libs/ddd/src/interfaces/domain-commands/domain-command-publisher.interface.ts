import { IDomainCommand } from './domain-command.interface';

export interface IDomainCommandPublisher<
  TDomainCommand extends IDomainCommand = IDomainCommand,
> {
  publish(domainCommand: TDomainCommand): void;
}
