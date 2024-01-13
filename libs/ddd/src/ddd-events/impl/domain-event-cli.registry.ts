import { Type } from '@nestjs/common';

export class DomainEventClsRegistry {
  private static readonly eventClsMap = new Map<string, any>();

  static add(eventCls: Type): void {
    this.eventClsMap.set(eventCls.name, eventCls);
  }

  static get(eventClsName: string): Type {
    const eventCls = this.eventClsMap.get(eventClsName);
    if (!eventCls) {
      throw new Error(`Event class "${eventClsName}" not registered`);
    }
    return eventCls;
  }
}
