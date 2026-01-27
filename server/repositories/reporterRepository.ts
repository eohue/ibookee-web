import { eq, sql, desc, count } from "drizzle-orm";
import { db } from "../db";
import {
    residentReporters,
    residentReporterComments,
    users,
    type ResidentReporter,
    type InsertResidentReporter,
    type ResidentReporterComment,
    type InsertResidentReporterComment
} from "@shared/schema";

export class ReporterRepository {
    async createReporterArticle(userId: string, data: InsertResidentReporter): Promise<ResidentReporter> {
        const [article] = await db.insert(residentReporters).values({
            ...data,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'pending',
            likes: 0,
            commentCount: 0
        }).returning();
        return article;
    }

    async getReporterArticles(status?: string, page: number = 1, limit: number = 20): Promise<{ articles: Omit<ResidentReporter, "content">[], total: number }> {
        const offset = (page - 1) * limit;

        const baseQuery = db.select({
            id: residentReporters.id,
            userId: residentReporters.userId,
            authorName: residentReporters.authorName,
            title: residentReporters.title,
            imageUrl: residentReporters.imageUrl,
            status: residentReporters.status,
            createdAt: residentReporters.createdAt,
            approvedAt: residentReporters.approvedAt,
            updatedAt: residentReporters.updatedAt,
            likes: residentReporters.likes,
            commentCount: residentReporters.commentCount,
        }).from(residentReporters);

        let conditions = undefined;
        if (status) {
            conditions = eq(residentReporters.status, status);
        }

        const [articlesResult, countResult] = await Promise.all([
            (conditions ? baseQuery.where(conditions) : baseQuery)
                .orderBy(desc(residentReporters.createdAt))
                .limit(limit)
                .offset(offset),

            db.select({ count: count() })
                .from(residentReporters)
                .where(conditions || undefined)
        ]);

        return {
            articles: articlesResult,
            total: countResult[0]?.count || 0
        };
    }

    async getReporterArticlesByUser(userId: string): Promise<ResidentReporter[]> {
        return db.select()
            .from(residentReporters)
            .where(eq(residentReporters.userId, userId))
            .orderBy(sql`${residentReporters.createdAt} DESC`);
    }

    async getReporterArticle(id: string): Promise<ResidentReporter | undefined> {
        const result = await db.select().from(residentReporters).where(eq(residentReporters.id, id));
        return result[0];
    }

    async updateReporterArticle(id: string, userId: string, data: Partial<InsertResidentReporter>): Promise<ResidentReporter | undefined> {
        const [article] = await db
            .update(residentReporters)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(residentReporters.id, id))
            .returning();
        return article;
    }

    async updateReporterArticleStatus(id: string, status: string): Promise<ResidentReporter | undefined> {
        const updateData: any = { status, updatedAt: new Date() };
        if (status === 'approved') {
            updateData.approvedAt = new Date();
        }
        const [article] = await db
            .update(residentReporters)
            .set(updateData)
            .where(eq(residentReporters.id, id))
            .returning();
        return article;
    }

    async adminUpdateReporterArticle(id: string, data: Partial<InsertResidentReporter>): Promise<ResidentReporter | undefined> {
        const [article] = await db
            .update(residentReporters)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(residentReporters.id, id))
            .returning();
        return article;
    }

    async deleteReporterArticle(id: string): Promise<boolean> {
        const [deleted] = await db
            .delete(residentReporters)
            .where(eq(residentReporters.id, id))
            .returning();
        return !!deleted;
    }

    async likeReporterArticle(id: string): Promise<void> {
        await db.update(residentReporters)
            .set({ likes: sql`${residentReporters.likes} + 1` })
            .where(eq(residentReporters.id, id));
    }

    async getReporterArticleComments(articleId: string): Promise<ResidentReporterComment[]> {
        return await db.select().from(residentReporterComments)
            .where(eq(residentReporterComments.articleId, articleId))
            .orderBy(residentReporterComments.createdAt);
    }

    async createReporterArticleComment(comment: InsertResidentReporterComment): Promise<ResidentReporterComment> {
        const [newComment] = await db
            .insert(residentReporterComments)
            .values(comment)
            .returning();

        // Increment comment count
        await db.update(residentReporters)
            .set({ commentCount: sql`${residentReporters.commentCount} + 1` })
            .where(eq(residentReporters.id, comment.articleId));

        return newComment;
    }

    async deleteReporterArticleComment(commentId: string): Promise<void> {
        const [comment] = await db
            .delete(residentReporterComments)
            .where(eq(residentReporterComments.id, commentId))
            .returning();

        if (comment) {
            await db.update(residentReporters)
                .set({ commentCount: sql`${residentReporters.commentCount} - 1` })
                .where(eq(residentReporters.id, comment.articleId));
        }
    }
}
