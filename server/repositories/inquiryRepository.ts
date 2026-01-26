import { eq } from "drizzle-orm";
import { db } from "../db";
import {
    inquiries,
    type Inquiry,
    type InsertInquiry
} from "@shared/schema";

export class InquiryRepository {
    async getInquiries(): Promise<Inquiry[]> {
        return db.select().from(inquiries);
    }

    async getInquiriesByType(type: string): Promise<Inquiry[]> {
        return db.select().from(inquiries).where(eq(inquiries.type, type));
    }

    async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
        const result = await db.insert(inquiries).values(inquiry).returning();
        return result[0];
    }

    async deleteInquiry(id: string): Promise<void> {
        await db.delete(inquiries).where(eq(inquiries.id, id));
    }
}
