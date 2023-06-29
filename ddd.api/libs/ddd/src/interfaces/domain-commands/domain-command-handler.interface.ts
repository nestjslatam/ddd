import { IDomainCommand } from './domain-command.interface';

export interface IDomainCommandHandler<
  TDomainCommand extends IDomainCommand = IDomainCommand,
> {
  execute(command: TDomainCommand): Promise<void>;
}
