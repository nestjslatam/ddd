import { DomainEvent } from '@nestjslatam/ddd-lib';

export class SingerSubscribedDomainEvent extends DomainEvent {
  constructor(
    readonly singerId: string,
    readonly ocurredOn: Date,
  ) {
    super({
      aggregateId: singerId,
      eventName: SingerSubscribedDomainEvent.name,
    });
  }
  toPlain() {
    return {
      singerId: this.singerId,
      ocurredOn: this.ocurredOn,
      status: 'subscribed',
    };
  }
}
