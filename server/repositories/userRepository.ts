import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import {
    users,
    residentReporters,
    type User,
    type UpsertUser
} from "@shared/schema";

export class UserRepository {
    async getUser(id: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
    }

    async getUserByGoogleId(googleId: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
        return user;
    }

    async getUserByNaverId(naverId: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.naverId, naverId));
        return user;
    }

    async getUserByKakaoId(kakaoId: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.kakaoId, kakaoId));
        return user;
    }

    async upsertUser(userData: UpsertUser): Promise<User> {
        const [user] = await db
            .insert(users)
            .values(userData)
            .onConflictDoUpdate({
                target: users.id,
                set: {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    profileImageUrl: userData.profileImageUrl,
                    role: userData.role,
                    googleId: userData.googleId,
                    naverId: userData.naverId,
                    kakaoId: userData.kakaoId,
                    isVerified: userData.isVerified,
                    realName: userData.realName,
                    phoneNumber: userData.phoneNumber,
                    updatedAt: new Date(),
                },
            })
            .returning();
        return user;
    }

    async getUsers(): Promise<User[]> {
        return db.select().from(users).orderBy(users.createdAt);
    }

    async updateUserRole(id: string, role: string): Promise<User | undefined> {
        const [user] = await db
            .update(users)
            .set({ role, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return user;
    }

    async verifyUserRealName(userId: string, realName: string, phoneNumber: string): Promise<User | undefined> {
        const [user] = await db
            .update(users)
            .set({
                realName,
                phoneNumber,
                isVerified: true,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning();
        return user;
    }

    async deleteUser(id: string): Promise<void> {
        await db.delete(users).where(eq(users.id, id));
    }

    async updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined> {
        const [user] = await db
            .update(users)
            .set({ password: hashedPassword, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return user;
    }

    async updateUserProfile(id: string, data: { realName?: string; nickname?: string }): Promise<User | undefined> {
        const [user] = await db
            .update(users)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return user;
    }

    async updateUserProfileImage(userId: string, profileImageUrl: string): Promise<User | undefined> {
        const [user] = await db
            .update(users)
            .set({ profileImageUrl, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning();
        return user;
    }
}
