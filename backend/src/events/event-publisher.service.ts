import { Injectable, Logger } from "@nestjs/common";
import { DomainEvent } from "./domain-event";

type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void> | void;

@Injectable()
export class EventPublisher {
  private readonly logger = new Logger(EventPublisher.name);
  private readonly handlers = new Map<string, EventHandler[]>();

  subscribe<T extends DomainEvent>(eventName: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventName) ?? [];
    existing.push(handler as EventHandler);
    this.handlers.set(eventName, existing);
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.name) ?? [];
    await Promise.all(handlers.map((handler) => handler(event)));
    this.logger.debug(`Published domain event ${event.name} for ${event.aggregateId}`);
  }
}
