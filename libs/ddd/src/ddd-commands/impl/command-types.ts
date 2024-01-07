import { Type } from '@nestjs/common';
import { IDomainCommand, IDomainCommandHandler } from '../interfaces';

export type CommandHandlerType = Type<IDomainCommandHandler<IDomainCommand>>;
