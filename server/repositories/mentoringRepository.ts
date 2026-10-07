import { eq, desc, and, or, sql } from "drizzle-orm";
import { db } from "../db";
import {
  mentors,
  mentoringConsultations,
  type Mentor,
  type InsertMentor,
  type MentoringConsultation,
  type InsertMentoringConsultation,
} from "@shared/schema";

export class MentoringRepository {
  // Mentors
  async getMentors(status: string = "active"): Promise<Mentor[]> {
    if (status === "all") {
      return db.select().from(mentors).orderBy(desc(mentors.displayOrder), desc(mentors.createdAt));
    }
    return db
      .select()
      .from(mentors)
      .where(eq(mentors.status, status))
      .orderBy(desc(mentors.displayOrder), desc(mentors.createdAt));
  }

  async getMentor(id: string): Promise<Mentor | undefined> {
    const result = await db.select().from(mentors).where(eq(mentors.id, id));
    return result[0];
  }

  async createMentor(mentorData: InsertMentor): Promise<Mentor> {
    const result = await db.insert(mentors).values(mentorData).returning();
    return result[0];
  }

  async updateMentor(id: string, mentorData: Partial<InsertMentor>): Promise<Mentor | undefined> {
    const result = await db.update(mentors).set(mentorData).where(eq(mentors.id, id)).returning();
    return result[0];
  }

  async deleteMentor(id: string): Promise<void> {
    await db.delete(mentors).where(eq(mentors.id, id));
  }

  // Consultations
  async getConsultations(filters?: {
    category?: string;
    mentorId?: string;
  }): Promise<MentoringConsultation[]> {
    let query = db.select().from(mentoringConsultations);
    const conditions = [];

    if (filters?.category && filters.category !== "all") {
      conditions.push(eq(mentoringConsultations.category, filters.category));
    }
    if (filters?.mentorId) {
      conditions.push(eq(mentoringConsultations.mentorId, filters.mentorId));
    }

    if (conditions.length > 0) {
      return query.where(and(...conditions)).orderBy(desc(mentoringConsultations.createdAt));
    }

    return query.orderBy(desc(mentoringConsultations.createdAt));
  }

  async getConsultation(id: string): Promise<MentoringConsultation | undefined> {
    const result = await db.select().from(mentoringConsultations).where(eq(mentoringConsultations.id, id));
    return result[0];
  }

  async createConsultation(data: InsertMentoringConsultation): Promise<MentoringConsultation> {
    const result = await db.insert(mentoringConsultations).values(data).returning();
    return result[0];
  }

  async updateConsultation(
    id: string,
    data: Partial<MentoringConsultation>
  ): Promise<MentoringConsultation | undefined> {
    const result = await db
      .update(mentoringConsultations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(mentoringConsultations.id, id))
      .returning();
    return result[0];
  }

  async answerConsultation(
    id: string,
    answer: string,
    answeredBy?: string
  ): Promise<MentoringConsultation | undefined> {
    const result = await db
      .update(mentoringConsultations)
      .set({
        answer,
        answeredBy: answeredBy || null,
        status: "answered",
        answeredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(mentoringConsultations.id, id))
      .returning();
    return result[0];
  }

  async incrementConsultationViews(id: string): Promise<void> {
    await db
      .update(mentoringConsultations)
      .set({ views: sql`${mentoringConsultations.views} + 1` })
      .where(eq(mentoringConsultations.id, id));
  }

  async deleteConsultation(id: string): Promise<void> {
    await db.delete(mentoringConsultations).where(eq(mentoringConsultations.id, id));
  }
}
