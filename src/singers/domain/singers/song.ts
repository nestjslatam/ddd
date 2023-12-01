/* eslint-disable @typescript-eslint/no-unused-vars */
import { DomainValueObject } from '@nestjslatam/ddd-lib';

import { Id, Name } from '../../../shared';

interface ISingerSongProps {
  songId: Id;
  songName: Name;
}

interface ISingerSongLoadProps {
  songId: string;
  songName: string;
}

export class SingerSong extends DomainValueObject<ISingerSongProps> {
  constructor(props: ISingerSongProps) {
    super(props);
  }

  static create(props: ISingerSongProps): SingerSong {
    return new SingerSong(props);
  }

  static load(props: ISingerSongLoadProps): SingerSong {
    return new SingerSong({
      songId: Id.load(props.songId),
      songName: Name.create(props.songName),
    });
  }

  protected businessRules(props: ISingerSongProps): void {
    throw new Error('Method not implemented.');
  }
}
