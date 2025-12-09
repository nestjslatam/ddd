
import { jest } from '@jest/globals';
import { DomainCommandHandler, DomainEventHandler } from './index';
import { IDomainCommand } from '../ddd-commands';
import { IDomainEvent } from '../ddd-events';
import { ReflectCommandHelper } from './reflect-command.helper';
import { ReflectEventHelper } from './reflect-event.helper';

class TestCommand implements IDomainCommand {
  readonly metadata = { id: 'TestCommand' };
}

@DomainCommandHandler(TestCommand)
class TestCommandHandler {
  async execute() {}
}

class TestEvent implements IDomainEvent {
  constructor(public readonly aggregateId: string) {}
}

@DomainEventHandler(TestEvent)
class TestEventHandler {
  handle() {}
}

describe('Reflect Helpers', () => {
  describe('ReflectCommandHelper', () => {
    it('should get the command id from a command', () => {
      const command = new TestCommand();
      const commandId = ReflectCommandHelper.getCommandId(command);
      expect(commandId).toBeDefined();
    });

    it('should reflect the command id from a handler', () => {
      const commandId = ReflectCommandHelper.reflectCommandId(TestCommandHandler);
      expect(commandId).toBeDefined();
    });
  });

  describe('ReflectEventHelper', () => {
    it('should get the domain event id from an event', () => {
      const event = new TestEvent('123');
      const eventId = ReflectEventHelper.getDomainEventId(event);
      expect(eventId).toBeDefined();
    });

    it('should get the reflected domain event id from an event type', () => {
      const eventId = ReflectEventHelper.getReflectDomainEventId(TestEvent);
      expect(eventId).toBeDefined();
    });

    it('should reflect the events from a handler', () => {
      const events = ReflectEventHelper.reflectEvents(TestEventHandler);
      expect(events).toEqual([TestEvent]);
    });
  });
});
