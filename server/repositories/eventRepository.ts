import { eq } from "drizzle-orm";
import { db } from "../db";
import {
    events,
    type Event,
    type InsertEvent
} from "@shared/schema";

export class EventRepository {
    async getEvents(): Promise<Event[]> {
        return db.select().from(events);
    }

    async getEvent(id: string): Promise<Event | undefined> {
        const result = await db.select().from(events).where(eq(events.id, id));
        return result[0];
    }

    async createEvent(event: InsertEvent): Promise<Event> {
        const result = await db.insert(events).values(event).returning();
        return result[0];
    }

    async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined> {
        const result = await db.update(events).set(event).where(eq(events.id, id)).returning();
        return result[0];
    }

    async deleteEvent(id: string): Promise<void> {
        await db.delete(events).where(eq(events.id, id));
    }
}
