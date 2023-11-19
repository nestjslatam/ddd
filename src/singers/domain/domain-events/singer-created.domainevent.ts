import { DomainEvent } from '@nestjslatam/ddd-lib';

export class SingerCreatedDomainEvent extends DomainEvent {
  constructor(
    readonly singerId: string,
    readonly singerName: string,
  ) {
    super({
      aggregateId: singerId,
      eventName: SingerCreatedDomainEvent.name,
    });
  }
  toPlain() {
    return {
      singerId: this.singerId,
      singerName: this.singerName,
      status: 'subscribed',
    };
  }
}
