import { eq, desc, count } from "drizzle-orm";
import { db } from "../db";
import {
    inquiries,
    type Inquiry,
    type InsertInquiry
} from "@shared/schema";

export class InquiryRepository {
    async getInquiries(page: number = 1, limit: number = 20, type?: string): Promise<{ inquiries: Inquiry[], total: number }> {
        const filters = [];
        if (type && type !== "all") {
            filters.push(eq(inquiries.type, type));
        }

        const whereClause = filters.length > 0 ? filters[0] : undefined;

        const [totalResult] = await db.select({ count: count() })
            .from(inquiries)
            .where(whereClause);

        const items = await db.select()
            .from(inquiries)
            .where(whereClause)
            .orderBy(desc(inquiries.createdAt))
            .limit(limit)
            .offset((page - 1) * limit);

        return { inquiries: items, total: Number(totalResult?.count || 0) };
    }

    async getInquiriesByType(type: string): Promise<Inquiry[]> {
        return db.select().from(inquiries).where(eq(inquiries.type, type));
    }

    async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
        const result = await db.insert(inquiries).values(inquiry).returning();
        return result[0];
    }

    async getInquiry(id: string): Promise<Inquiry | undefined> {
        const items = await db.select().from(inquiries).where(eq(inquiries.id, id));
        return items[0];
    }

    async updateInquiry(id: string, updateData: Partial<Inquiry>): Promise<Inquiry | undefined> {
        const result = await db.update(inquiries)
            .set(updateData)
            .where(eq(inquiries.id, id))
            .returning();
        return result[0];
    }

    async deleteInquiry(id: string): Promise<void> {
        await db.delete(inquiries).where(eq(inquiries.id, id));
    }
}
