import { DomainEvent } from '../../../../libs/ddd/src';

export class RegisteredSingerEvent extends DomainEvent {
  constructor(readonly singerId: string, readonly singerName: string) {
    super({
      aggregateId: singerId,
      eventName: RegisteredSingerEvent.name,
    });
  }
  toPlain() {
    return {
      singerId: this.singerId,
      songName: this.singerName,
      status: 'registered',
    };
  }
}
