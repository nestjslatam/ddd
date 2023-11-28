import { IDomainCommand } from './command.interface';

export interface IDomainCommandHandler<
  TDomainCommand extends IDomainCommand = any,
  TResult = any,
> {
  execute(domainCommand: TDomainCommand): Promise<TResult>;
}
