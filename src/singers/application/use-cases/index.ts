import {
  AddSongToSingerCommandHandler,
  AddSongToSingerController,
  ChangePictureSingerCommandHandler,
  ChangePictureSingerController,
  RemoveSongToSingerCommandHandler,
  RemoveSongToSingerController,
} from './commands';
import {
  ChangeFullNameSingerCommandHandler,
  ChangeFullNameSingerController,
} from './commands/change-fullname-singer';
import {
  CreateSingerController,
  SingerCreatedDomainEventHandler,
} from './commands/create-singer';
import { CreateSingerCommandHandler } from './commands/create-singer/create-singer.command-handler';
import { RemoveSingerCommandHandler } from './commands/remove-singer';
import { RemoveSingerController } from './commands/remove-singer/remove-singer.controller';
import {
  SingerSubscribedDomainEventHandler,
  SubscribeSingerCommandHandler,
  SubscribeSingerController,
} from './commands/subscribe-singer';

export const singerCommandHandlers = [
  CreateSingerCommandHandler,
  ChangeFullNameSingerCommandHandler,
  ChangePictureSingerCommandHandler,
  SubscribeSingerCommandHandler,
  RemoveSingerCommandHandler,
  AddSongToSingerCommandHandler,
  RemoveSongToSingerCommandHandler,
];

export const singerControllers = [
  CreateSingerController,
  ChangeFullNameSingerController,
  ChangePictureSingerController,
  SubscribeSingerController,
  RemoveSingerController,
  AddSongToSingerController,
  RemoveSongToSingerController,
];

export const singerDomainEventHandlers = [
  SingerCreatedDomainEventHandler,
  SingerSubscribedDomainEventHandler,
];
