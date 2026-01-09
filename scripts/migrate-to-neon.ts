/**
 * db.json 데이터를 Neon 데이터베이스로 마이그레이션하는 스크립트
 * 
 * 마이그레이션 대상:
 * 1. 프로젝트 (projects)
 * 2. 인사이트 (articles)
 * 3. 소셜 스트림 (socialAccounts, communityPosts)
 * 4. 연혁 (historyMilestones)
 * 5. 페이지 이미지 (pageImages)
 * 6. 사이트 설정 (siteSettings)
 * 
 * 실행: npx tsx scripts/migrate-to-neon.ts
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { db, pool } from "../server/db";
import {
    projects,
    articles,
    socialAccounts,
    communityPosts,
    historyMilestones,
    pageImages,
    siteSettings,
} from "../shared/schema";

interface DbJsonData {
    projects: Array<[string, any]>;
    articles: Array<[string, any]>;
    socialAccounts: Array<[string, any]>;
    communityPosts: Array<[string, any]>;
    historyMilestones: Array<[string, any]>;
    pageImages: Array<[string, any]>;
    siteSettings: Array<[string, any]>;
}

async function migrate() {
    console.log("🚀 Neon DB 마이그레이션 시작...\n");

    // db.json 파일 읽기
    const dbFilePath = path.resolve(process.cwd(), "db.json");
    if (!fs.existsSync(dbFilePath)) {
        console.error("❌ db.json 파일을 찾을 수 없습니다.");
        process.exit(1);
    }

    const rawData = fs.readFileSync(dbFilePath, "utf-8");
    const data: DbJsonData = JSON.parse(rawData);

    try {
        // 1. 프로젝트 마이그레이션
        console.log("📦 프로젝트 마이그레이션 중...");
        if (data.projects && data.projects.length > 0) {
            for (const [_, project] of data.projects) {
                await db.insert(projects).values({
                    id: project.id,
                    title: project.title,
                    titleEn: project.titleEn || null,
                    location: project.location,
                    category: project.category,
                    description: project.description,
                    imageUrl: project.imageUrl,
                    year: project.year,
                    units: project.units || null,
                    featured: project.featured || false,
                    partnerLogos: project.partnerLogos || null,
                }).onConflictDoNothing();
            }
            console.log(`  ✅ ${data.projects.length}개 프로젝트 완료`);
        }

        // 2. 인사이트 (Articles) 마이그레이션
        console.log("\n📰 인사이트 마이그레이션 중...");
        if (data.articles && data.articles.length > 0) {
            for (const [_, article] of data.articles) {
                await db.insert(articles).values({
                    id: article.id,
                    title: article.title,
                    excerpt: article.excerpt,
                    content: article.content,
                    author: article.author,
                    category: article.category,
                    imageUrl: article.imageUrl || null,
                    fileUrl: article.fileUrl || null,
                    publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
                    featured: article.featured || false,
                }).onConflictDoNothing();
            }
            console.log(`  ✅ ${data.articles.length}개 인사이트 완료`);
        }

        // 3. 소셜 계정 마이그레이션
        console.log("\n👤 소셜 계정 마이그레이션 중...");
        if (data.socialAccounts && data.socialAccounts.length > 0) {
            for (const [_, account] of data.socialAccounts) {
                await db.insert(socialAccounts).values({
                    id: account.id,
                    name: account.name,
                    platform: account.platform,
                    username: account.username,
                    profileUrl: account.profileUrl || null,
                    profileImageUrl: account.profileImageUrl || null,
                    isActive: account.isActive ?? true,
                    createdAt: account.createdAt ? new Date(account.createdAt) : new Date(),
                }).onConflictDoNothing();
            }
            console.log(`  ✅ ${data.socialAccounts.length}개 소셜 계정 완료`);
        }

        // 4. 소셜 스트림 (Community Posts) 마이그레이션
        console.log("\n📱 소셜 스트림 마이그레이션 중...");
        if (data.communityPosts && data.communityPosts.length > 0) {
            for (const [_, post] of data.communityPosts) {
                await db.insert(communityPosts).values({
                    id: post.id,
                    accountId: post.accountId || null,
                    imageUrl: post.imageUrl || null,
                    images: post.images || null,
                    embedCode: post.embedCode || null,
                    caption: post.caption || null,
                    location: post.location || null,
                    likes: post.likes || 0,
                    hashtags: post.hashtags || null,
                    sourceUrl: post.sourceUrl || null,
                    externalId: post.externalId || null,
                    postedAt: post.postedAt ? new Date(post.postedAt) : new Date(),
                    createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
                    commentCount: post.commentCount || 0,
                }).onConflictDoNothing();
            }
            console.log(`  ✅ ${data.communityPosts.length}개 소셜 스트림 완료`);
        }

        // 5. 연혁 (History Milestones) 마이그레이션
        console.log("\n📅 연혁 마이그레이션 중...");
        if (data.historyMilestones && data.historyMilestones.length > 0) {
            for (const [_, milestone] of data.historyMilestones) {
                await db.insert(historyMilestones).values({
                    id: milestone.id,
                    year: milestone.year,
                    month: milestone.month || null,
                    title: milestone.title,
                    description: milestone.description || null,
                    link: milestone.link || null,
                    imageUrl: milestone.imageUrl || null,
                    isHighlight: milestone.isHighlight || false,
                    displayOrder: milestone.displayOrder || 0,
                }).onConflictDoNothing();
            }
            console.log(`  ✅ ${data.historyMilestones.length}개 연혁 완료`);
        }

        // 6. 페이지 이미지 마이그레이션
        console.log("\n🖼️ 페이지 이미지 마이그레이션 중...");
        if (data.pageImages && data.pageImages.length > 0) {
            for (const [_, image] of data.pageImages) {
                await db.insert(pageImages).values({
                    id: image.id,
                    pageKey: image.pageKey,
                    imageKey: image.imageKey,
                    imageUrl: image.imageUrl,
                    altText: image.altText || null,
                    displayOrder: image.displayOrder || 0,
                }).onConflictDoNothing();
            }
            console.log(`  ✅ ${data.pageImages.length}개 페이지 이미지 완료`);
        }

        // 7. 사이트 설정 마이그레이션
        console.log("\n⚙️ 사이트 설정 마이그레이션 중...");
        if (data.siteSettings && data.siteSettings.length > 0) {
            for (const [key, setting] of data.siteSettings) {
                await db.insert(siteSettings).values({
                    id: setting.id,
                    key: setting.key,
                    value: setting.value,
                    updatedAt: setting.updatedAt ? new Date(setting.updatedAt) : new Date(),
                }).onConflictDoNothing();
            }
            console.log(`  ✅ ${data.siteSettings.length}개 사이트 설정 완료`);
        }

        console.log("\n🎉 마이그레이션 완료!");
        console.log("\n📊 마이그레이션 요약:");
        console.log(`  - 프로젝트: ${data.projects?.length || 0}개`);
        console.log(`  - 인사이트: ${data.articles?.length || 0}개`);
        console.log(`  - 소셜 계정: ${data.socialAccounts?.length || 0}개`);
        console.log(`  - 소셜 스트림: ${data.communityPosts?.length || 0}개`);
        console.log(`  - 연혁: ${data.historyMilestones?.length || 0}개`);
        console.log(`  - 페이지 이미지: ${data.pageImages?.length || 0}개`);
        console.log(`  - 사이트 설정: ${data.siteSettings?.length || 0}개`);

    } catch (error) {
        console.error("❌ 마이그레이션 오류:", error);
        throw error;
    } finally {
        await pool.end();
    }
}

migrate().catch((error) => {
    console.error("마이그레이션 실패:", error);
    process.exit(1);
});
