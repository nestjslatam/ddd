import {
  AddSongToSingerCommandHandler,
  AddSongToSingerController,
} from './add-song-singer';
import {
  ChangeFullNameSingerCommandHandler,
  ChangeFullNameSingerController,
} from './change-fullname-singer';
import {
  ChangePictureSingerCommandHandler,
  ChangePictureSingerController,
} from './change-picture-singer';
import {
  CreateSingerCommandHandler,
  CreateSingerController,
  SingerCreatedDomainEventHandler,
} from './create-singer';
import {
  RemoveSingerCommandHandler,
  RemoveSingerController,
} from './remove-singer';
import {
  RemoveSongToSingerCommandHandler,
  RemoveSongToSingerController,
} from './remove-song-singer';
import {
  SingerSubscribedDomainEventHandler,
  SubscribeSingerCommandHandler,
  SubscribeSingerController,
} from './subscribe-singer';

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
