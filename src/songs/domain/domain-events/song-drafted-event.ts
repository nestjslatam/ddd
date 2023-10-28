import { DomainEvent } from '@nestjslatam/ddd';

export class SongDraftedEvent extends DomainEvent {
  constructor(readonly songId, readonly songName) {
    super({
      eventName: SongDraftedEvent.name,
      aggregateId: songId,
    });
  }

  toPlain() {
    return {
      songId: this.songId,
      songName: this.songName,
      status: 'drafted',
    };
  }
}
