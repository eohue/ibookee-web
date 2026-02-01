import { eq, desc, and } from "drizzle-orm";
import { db } from "../db";
import { projectUnits, type InsertProjectUnit, type ProjectUnit } from "@shared/schema";

export class UnitRepository {
    async getProjectUnits(projectId: string): Promise<ProjectUnit[]> {
        return await db
            .select()
            .from(projectUnits)
            .where(eq(projectUnits.projectId, projectId))
            .orderBy(projectUnits.displayOrder, projectUnits.unitNumber);
    }

    async searchProjectUnits(filters: { projectId?: string; status?: string }): Promise<ProjectUnit[]> {
        const conditions = [];
        if (filters.projectId) conditions.push(eq(projectUnits.projectId, filters.projectId));
        if (filters.status) conditions.push(eq(projectUnits.status, filters.status));

        let query = db.select().from(projectUnits);

        if (conditions.length > 0) {
            // @ts-ignore - Drizzle specific type issue
            query = query.where(and(...conditions));
        }

        return await query.orderBy(projectUnits.displayOrder, projectUnits.unitNumber);
    }

    async getProjectUnit(id: string): Promise<ProjectUnit | undefined> {
        const [unit] = await db
            .select()
            .from(projectUnits)
            .where(eq(projectUnits.id, id));
        return unit;
    }

    async createProjectUnit(unit: InsertProjectUnit): Promise<ProjectUnit> {
        const [newUnit] = await db
            .insert(projectUnits)
            .values(unit)
            .returning();
        return newUnit;
    }

    async updateProjectUnit(id: string, unit: Partial<InsertProjectUnit>): Promise<ProjectUnit | undefined> {
        const [updatedUnit] = await db
            .update(projectUnits)
            .set(unit)
            .where(eq(projectUnits.id, id))
            .returning();
        return updatedUnit;
    }

    async deleteProjectUnit(id: string): Promise<void> {
        await db
            .delete(projectUnits)
            .where(eq(projectUnits.id, id));
    }
}
