import { eq } from "drizzle-orm";
import { db } from "../db";
import {
    housingRecruitments,
    type HousingRecruitment,
    type InsertHousingRecruitment
} from "@shared/schema";

export class HousingRepository {
    async getHousingRecruitments(): Promise<HousingRecruitment[]> {
        return db.select().from(housingRecruitments);
    }

    async getHousingRecruitment(id: string): Promise<HousingRecruitment | undefined> {
        const result = await db.select().from(housingRecruitments).where(eq(housingRecruitments.id, id));
        return result[0];
    }

    async getPublishedHousingRecruitments(): Promise<HousingRecruitment[]> {
        return db.select().from(housingRecruitments).where(eq(housingRecruitments.published, true));
    }

    async createHousingRecruitment(recruitment: InsertHousingRecruitment): Promise<HousingRecruitment> {
        const result = await db.insert(housingRecruitments).values(recruitment).returning();
        return result[0];
    }

    async updateHousingRecruitment(id: string, recruitment: Partial<InsertHousingRecruitment>): Promise<HousingRecruitment | undefined> {
        const result = await db.update(housingRecruitments).set(recruitment).where(eq(housingRecruitments.id, id)).returning();
        return result[0];
    }

    async deleteHousingRecruitment(id: string): Promise<void> {
        await db.delete(housingRecruitments).where(eq(housingRecruitments.id, id));
    }
}
