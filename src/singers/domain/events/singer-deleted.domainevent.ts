import { DomainEvent } from '@nestjslatam/ddd-lib';

export class SingerDeletedDomainEvent extends DomainEvent {
  constructor(
    readonly singerId: string,
    readonly singerName: string,
  ) {
    super({
      aggregateId: singerId,
      eventName: SingerDeletedDomainEvent.name,
    });
  }
  toRaw() {
    return {
      singerId: this.singerId,
      singerName: this.singerName,
      status: 'deleted',
    };
  }
}
