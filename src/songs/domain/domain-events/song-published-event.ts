import { DomainEvent } from '@nestjslatam/ddd-lib';

export class SongPublishedEvent extends DomainEvent {
  constructor(readonly songId: string, readonly songName: string) {
    super({
      aggregateId: songId,
      eventName: SongPublishedEvent.name,
    });
  }

  toPlain() {
    return {
      songId: this.songId,
      songName: this.songName,
      status: 'published',
    };
  }
}
