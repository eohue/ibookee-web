import { eq } from "drizzle-orm";
import { db } from "../db";
import {
    residentPrograms,
    programApplications,
    type ResidentProgram,
    type InsertResidentProgram,
    type ProgramApplication,
    type InsertProgramApplication
} from "@shared/schema";

export class ProgramRepository {
    // Resident Programs
    async getResidentPrograms(): Promise<ResidentProgram[]> {
        return db.select().from(residentPrograms);
    }

    async getResidentProgram(id: string): Promise<ResidentProgram | undefined> {
        const result = await db.select().from(residentPrograms).where(eq(residentPrograms.id, id));
        return result[0];
    }

    async getResidentProgramsByType(type: string): Promise<ResidentProgram[]> {
        return db.select().from(residentPrograms).where(eq(residentPrograms.programType, type));
    }

    async createResidentProgram(program: InsertResidentProgram): Promise<ResidentProgram> {
        const result = await db.insert(residentPrograms).values(program).returning();
        return result[0];
    }

    async updateResidentProgram(id: string, program: Partial<InsertResidentProgram>): Promise<ResidentProgram | undefined> {
        const result = await db.update(residentPrograms).set(program).where(eq(residentPrograms.id, id)).returning();
        return result[0];
    }

    async deleteResidentProgram(id: string): Promise<void> {
        await db.delete(residentPrograms).where(eq(residentPrograms.id, id));
    }

    // Program Applications
    async getProgramApplications(): Promise<ProgramApplication[]> {
        return db.select().from(programApplications);
    }

    async getProgramApplicationsByProgram(programId: string): Promise<ProgramApplication[]> {
        return db.select().from(programApplications).where(eq(programApplications.programId, programId));
    }

    async getProgramApplicationsByUser(userId: string): Promise<ProgramApplication[]> {
        return db.select().from(programApplications).where(eq(programApplications.userId, userId));
    }

    async createProgramApplication(application: InsertProgramApplication): Promise<ProgramApplication> {
        const result = await db.insert(programApplications).values(application).returning();
        return result[0];
    }

    async updateProgramApplicationStatus(id: string, status: string): Promise<ProgramApplication | undefined> {
        const result = await db.update(programApplications).set({ status }).where(eq(programApplications.id, id)).returning();
        return result[0];
    }

    async deleteProgramApplication(id: string): Promise<void> {
        await db.delete(programApplications).where(eq(programApplications.id, id));
    }
}
