import {
  CreateSingerController,
  SingerCreatedDomainEventHandler,
} from './commands/create-singer';
import { CreateSingerCommandHandler } from './commands/create-singer/create-singer.command-handler';

export const singerCommandHandlers = [CreateSingerCommandHandler];
export const singerControllers = [CreateSingerController];
export const singerDomainEventHandlers = [SingerCreatedDomainEventHandler];
