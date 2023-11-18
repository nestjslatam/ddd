/* eslint-disable @typescript-eslint/no-unused-vars */
import { DomainValueObject } from '../../../libs/ddd/src';
import { Id, Name } from '../../shared/domain';

interface ISingerSongProps {
  songId: Id;
  songName: Name;
}

export class SingerSong extends DomainValueObject<ISingerSongProps> {
  protected businessRules(props: ISingerSongProps): void {
    //
  }

  constructor(props: ISingerSongProps) {
    super(props);
  }

  static create(props: ISingerSongProps): SingerSong {
    return new SingerSong(props);
  }
}
