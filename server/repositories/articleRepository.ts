import { eq, desc, count, sql } from "drizzle-orm";
import { db } from "../db";
import {
    articles,
    type Article,
    type InsertArticle
} from "@shared/schema";

export class ArticleRepository {
    async getArticles(page: number = 1, limit: number = 100): Promise<{ articles: Omit<Article, "content">[], total: number }> {
        const offset = (page - 1) * limit;

        const [articlesResult, countResult] = await Promise.all([
            db.select({
                id: articles.id,
                title: articles.title,
                excerpt: articles.excerpt,
                author: articles.author,
                category: articles.category,
                imageUrl: articles.imageUrl,
                fileUrl: articles.fileUrl,
                sourceUrl: articles.sourceUrl,
                publishedAt: articles.publishedAt,
                featured: articles.featured,
            })
                .from(articles)
                .orderBy(desc(articles.publishedAt))
                .limit(limit)
                .offset(offset),

            db.select({ count: count() }).from(articles)
        ]);

        return {
            articles: articlesResult,
            total: countResult[0]?.count || 0
        };
    }

    async getArticle(id: string): Promise<Article | undefined> {
        const result = await db.select().from(articles).where(eq(articles.id, id));
        return result[0];
    }

    async getArticlesByCategory(category: string, page: number = 1, limit: number = 100): Promise<{ articles: Omit<Article, "content">[], total: number }> {
        const offset = (page - 1) * limit;

        const [articlesResult, countResult] = await Promise.all([
            db.select({
                id: articles.id,
                title: articles.title,
                excerpt: articles.excerpt,
                author: articles.author,
                category: articles.category,
                imageUrl: articles.imageUrl,
                fileUrl: articles.fileUrl,
                sourceUrl: articles.sourceUrl,
                publishedAt: articles.publishedAt,
                featured: articles.featured,
            })
                .from(articles)
                .where(eq(articles.category, category))
                .orderBy(desc(articles.publishedAt))
                .limit(limit)
                .offset(offset),

            db.select({ count: count() }).from(articles).where(eq(articles.category, category))
        ]);

        return {
            articles: articlesResult,
            total: countResult[0]?.count || 0
        };
    }

    async createArticle(article: InsertArticle): Promise<Article> {
        const result = await db.insert(articles).values(article).returning();
        return result[0];
    }

    async updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined> {
        const result = await db.update(articles).set(article).where(eq(articles.id, id)).returning();
        return result[0];
    }

    async deleteArticle(id: string): Promise<void> {
        await db.delete(articles).where(eq(articles.id, id));
    }
}
