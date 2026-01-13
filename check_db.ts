
import { db } from "./server/db";
import { communityPosts, articles } from "./shared/schema";
import { desc } from "drizzle-orm";

async function checkData() {
    console.log("--- Checking Community Posts ---");
    const posts = await db.select().from(communityPosts).orderBy(desc(communityPosts.createdAt)).limit(5);
    posts.forEach(p => {
        console.log(`ID: ${p.id}, ImageURL: ${p.imageUrl}, Images: ${JSON.stringify(p.images)}`);
    });

    console.log("\n--- Checking Articles ---");
    const art = await db.select().from(articles).orderBy(desc(articles.publishedAt)).limit(5);
    art.forEach(a => {
        console.log(`ID: ${a.id}, Title: ${a.title}, ImageURL: ${a.imageUrl}`);
    });
    process.exit(0);
}

checkData();
