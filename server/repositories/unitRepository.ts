import { eq, desc } from "drizzle-orm";
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
