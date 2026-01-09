/**
 * db.json 회원(users) 데이터를 Neon 데이터베이스로 마이그레이션하는 스크립트
 * 
 * 실행: npx tsx scripts/migrate-users.ts
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { db, pool } from "../server/db";
import { users } from "../shared/schema";

interface DbJsonData {
    users: Array<[string, any]>;
}

async function migrateUsers() {
    console.log("🚀 회원 정보 마이그레이션 시작...\n");

    // db.json 파일 읽기
    const dbFilePath = path.resolve(process.cwd(), "db.json");
    if (!fs.existsSync(dbFilePath)) {
        console.error("❌ db.json 파일을 찾을 수 없습니다.");
        process.exit(1);
    }

    const rawData = fs.readFileSync(dbFilePath, "utf-8");
    const data: DbJsonData = JSON.parse(rawData);

    try {
        console.log("👤 회원 정보 마이그레이션 중...");
        if (data.users && data.users.length > 0) {
            for (const [_, user] of data.users) {
                await db.insert(users).values({
                    id: user.id,
                    email: user.email || null,
                    firstName: user.firstName || null,
                    lastName: user.lastName || null,
                    profileImageUrl: user.profileImageUrl || null,
                    role: user.role || "user",
                    password: user.password || null,
                    googleId: user.googleId || null,
                    naverId: user.naverId || null,
                    kakaoId: user.kakaoId || null,
                    isVerified: user.isVerified || false,
                    realName: user.realName || null,
                    phoneNumber: user.phoneNumber || null,
                    createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                    updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
                }).onConflictDoNothing();
            }
            console.log(`  ✅ ${data.users.length}명 회원 정보 완료`);
        } else {
            console.log("  ⚠️ 마이그레이션할 회원 정보가 없습니다.");
        }

        console.log("\n🎉 회원 정보 마이그레이션 완료!");

    } catch (error) {
        console.error("❌ 마이그레이션 오류:", error);
        throw error;
    } finally {
        await pool.end();
    }
}

migrateUsers().catch((error) => {
    console.error("마이그레이션 실패:", error);
    process.exit(1);
});
