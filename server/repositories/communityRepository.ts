import { eq, sql, desc, count, arrayContains } from "drizzle-orm";
import { db } from "../db";
import {
    communityPosts,
    communityPostComments,
    residentPrograms,
    events,
    type CommunityPost,
    type InsertCommunityPost,
    type CommunityPostComment,
    type InsertCommunityPostComment,
    type CommunityFeedItem
} from "@shared/schema";

export class CommunityRepository {
    async getCommunityPosts(page: number = 1, limit: number = 20): Promise<{ posts: CommunityPost[], total: number }> {
        const offset = (page - 1) * limit;
        const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(communityPosts);
        const posts = await db.select().from(communityPosts)
            .orderBy(communityPosts.postedAt, communityPosts.createdAt)
            .limit(limit)
            .offset(offset);
        return { posts, total: Number(totalResult?.count || 0) };
    }

    async getCommunityPost(id: string): Promise<CommunityPost | undefined> {
        const result = await db.select().from(communityPosts).where(eq(communityPosts.id, id));
        return result[0];
    }

    async getCommunityPostsByHashtag(hashtag: string, page: number = 1, limit: number = 20): Promise<{ posts: CommunityPost[], total: number }> {
        const offset = (page - 1) * limit;
        const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(communityPosts)
            .where(arrayContains(communityPosts.hashtags, [hashtag]));
        const posts = await db.select().from(communityPosts)
            .where(arrayContains(communityPosts.hashtags, [hashtag]))
            .orderBy(communityPosts.postedAt, communityPosts.createdAt)
            .limit(limit)
            .offset(offset);
        return { posts, total: Number(totalResult?.count || 0) };
    }

    async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
        const result = await db.insert(communityPosts).values(post).returning();
        return result[0];
    }

    async updateCommunityPost(id: string, post: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined> {
        const result = await db.update(communityPosts).set(post).where(eq(communityPosts.id, id)).returning();
        return result[0];
    }

    async deleteCommunityPost(id: string): Promise<void> {
        await db.delete(communityPosts).where(eq(communityPosts.id, id));
    }

    async getCommunityPostComments(postId: string): Promise<CommunityPostComment[]> {
        return await db.select().from(communityPostComments).where(eq(communityPostComments.postId, postId)).orderBy(communityPostComments.createdAt);
    }

    async createCommunityPostComment(comment: InsertCommunityPostComment): Promise<CommunityPostComment> {
        const [newComment] = await db
            .insert(communityPostComments)
            .values(comment)
            .returning();

        // Increment comment count
        await db.update(communityPosts)
            .set({ commentCount: sql`${communityPosts.commentCount} + 1` })
            .where(eq(communityPosts.id, comment.postId));

        return newComment;
    }

    async deleteCommunityPostComment(id: string): Promise<void> {
        const [comment] = await db
            .delete(communityPostComments)
            .where(eq(communityPostComments.id, id))
            .returning();

        if (comment) {
            await db.update(communityPosts)
                .set({ commentCount: sql`${communityPosts.commentCount} - 1` })
                .where(eq(communityPosts.id, comment.postId));
        }
    }

    async likeCommunityPost(id: string): Promise<void> {
        await db.update(communityPosts)
            .set({ likes: sql`${communityPosts.likes} + 1` })
            .where(eq(communityPosts.id, id));
    }

    async getUnifiedCommunityFeed(limit: number): Promise<CommunityFeedItem[]> {
        const socialPosts = await db.select().from(communityPosts).orderBy(sql`${communityPosts.postedAt} DESC`).limit(limit);
        const programList = await db.select().from(residentPrograms).where(eq(residentPrograms.published, true)).orderBy(sql`${residentPrograms.createdAt} DESC`).limit(limit);
        const eventList = await db.select().from(events).where(eq(events.published, true)).orderBy(sql`${events.date} DESC`).limit(limit);

        const items: CommunityFeedItem[] = [
            ...socialPosts.map(post => ({
                id: post.id,
                type: 'social' as const,
                title: post.caption || "",
                imageUrl: post.imageUrl || (post.images && post.images.length > 0 ? post.images[0] : null),
                date: post.postedAt,
                likes: post.likes || 0,
                comments: post.commentCount || 0,
                hashtags: post.hashtags || []
            })),
            ...programList.map(program => ({
                id: program.id,
                type: 'program' as const,
                title: program.title,
                imageUrl: program.imageUrl,
                date: program.createdAt,
            })),
            ...eventList.map(event => ({
                id: event.id,
                type: 'event' as const,
                title: event.title,
                imageUrl: event.imageUrl,
                date: event.date
            }))
        ];

        return items
            .sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA;
            })
            .slice(0, limit);
    }
}
