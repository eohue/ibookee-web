/**
 * Neon DB 마이그레이션 검증 스크립트
 * 
 * 실행: npx tsx scripts/verify-migration.ts
 */

import "dotenv/config";
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
import { sql } from "drizzle-orm";

async function verify() {
    console.log("🔍 Neon DB 마이그레이션 검증 중...\n");

    try {
        // 각 테이블의 레코드 수 확인
        const [projectCount] = await db.select({ count: sql<number>`count(*)` }).from(projects);
        const [articleCount] = await db.select({ count: sql<number>`count(*)` }).from(articles);
        const [socialAccountCount] = await db.select({ count: sql<number>`count(*)` }).from(socialAccounts);
        const [communityPostCount] = await db.select({ count: sql<number>`count(*)` }).from(communityPosts);
        const [historyMilestoneCount] = await db.select({ count: sql<number>`count(*)` }).from(historyMilestones);
        const [pageImageCount] = await db.select({ count: sql<number>`count(*)` }).from(pageImages);
        const [siteSettingCount] = await db.select({ count: sql<number>`count(*)` }).from(siteSettings);

        console.log("📊 Neon DB 데이터 요약:");
        console.log(`  - 프로젝트: ${projectCount.count}개`);
        console.log(`  - 인사이트: ${articleCount.count}개`);
        console.log(`  - 소셜 계정: ${socialAccountCount.count}개`);
        console.log(`  - 소셜 스트림: ${communityPostCount.count}개`);
        console.log(`  - 연혁: ${historyMilestoneCount.count}개`);
        console.log(`  - 페이지 이미지: ${pageImageCount.count}개`);
        console.log(`  - 사이트 설정: ${siteSettingCount.count}개`);

        // 샘플 데이터 출력
        console.log("\n📦 프로젝트 샘플:");
        const sampleProjects = await db.select().from(projects).limit(2);
        sampleProjects.forEach(p => console.log(`  - ${p.title} (${p.year})`));

        console.log("\n📅 연혁 샘플:");
        const sampleMilestones = await db.select().from(historyMilestones).limit(3);
        sampleMilestones.forEach(m => console.log(`  - ${m.year}: ${m.title}`));

        console.log("\n⚙️ 사이트 설정 키:");
        const allSettings = await db.select().from(siteSettings);
        allSettings.forEach(s => console.log(`  - ${s.key}`));

        console.log("\n✅ 검증 완료!");

    } catch (error) {
        console.error("❌ 검증 오류:", error);
        throw error;
    } finally {
        await pool.end();
    }
}

verify().catch((error) => {
    console.error("검증 실패:", error);
    process.exit(1);
});
