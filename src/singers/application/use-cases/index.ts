import { CreateSingerController } from './create-singer';
import { CreateSingerCommandHandler } from './create-singer/create-singer.command-handler';

export const singerCommandHandlers = [CreateSingerCommandHandler];
export const singerControllers = [CreateSingerController];
