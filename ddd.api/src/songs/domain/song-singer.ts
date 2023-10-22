/* eslint-disable @typescript-eslint/no-unused-vars */
import { DomainValueObject } from '@nestjslatam/ddd';
import { Id, Name } from '../../shared/domain';

interface ISingerArtistProps {
  id: Id;
  name: Name;
}

export class SongSinger extends DomainValueObject<ISingerArtistProps> {
  protected businessRules(props: ISingerArtistProps): void {
    //
  }

  static create(id: Id, name: Name): SongSinger {
    return new SongSinger({ id, name });
  }

  static load(id: string, name: string): SongSinger {
    return new SongSinger({ id: Id.load(id), name: Name.create(name) });
  }

  get id(): Id {
    return this.props.id;
  }

  get name(): Name {
    return this.props.name;
  }
}
