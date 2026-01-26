import { eq, and } from "drizzle-orm";
import { db } from "../db";
import {
    siteSettings,
    socialAccounts,
    partners,
    historyMilestones,
    pageImages,
    editablePages,
    type SiteSetting,
    type InsertSiteSetting,
    type SocialAccount,
    type InsertSocialAccount,
    type Partner,
    type InsertPartner,
    type HistoryMilestone,
    type InsertHistoryMilestone,
    type PageImage,
    type InsertPageImage,
    type EditablePage,
    type InsertEditablePage
} from "@shared/schema";

export class SiteRepository {
    // Site Settings
    async getSiteSettings(): Promise<SiteSetting[]> {
        return db.select().from(siteSettings);
    }

    async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
        const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
        return result[0];
    }

    async upsertSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
        const existing = await this.getSiteSetting(setting.key);
        if (existing) {
            const result = await db.update(siteSettings).set({ value: setting.value, updatedAt: new Date() }).where(eq(siteSettings.key, setting.key)).returning();
            return result[0];
        }
        const result = await db.insert(siteSettings).values(setting).returning();
        return result[0];
    }

    async deleteSiteSetting(key: string): Promise<void> {
        await db.delete(siteSettings).where(eq(siteSettings.key, key));
    }

    // Social Accounts
    async getSocialAccounts(): Promise<SocialAccount[]> {
        return db.select().from(socialAccounts);
    }

    async getSocialAccount(id: string): Promise<SocialAccount | undefined> {
        const result = await db.select().from(socialAccounts).where(eq(socialAccounts.id, id));
        return result[0];
    }

    async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
        const result = await db.insert(socialAccounts).values(account).returning();
        return result[0];
    }

    async updateSocialAccount(id: string, account: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined> {
        const result = await db.update(socialAccounts).set(account).where(eq(socialAccounts.id, id)).returning();
        return result[0];
    }

    async deleteSocialAccount(id: string): Promise<void> {
        await db.delete(socialAccounts).where(eq(socialAccounts.id, id));
    }

    // Partners
    async getPartners(): Promise<Partner[]> {
        return db.select().from(partners);
    }

    async createPartner(partner: InsertPartner): Promise<Partner> {
        const result = await db.insert(partners).values(partner).returning();
        return result[0];
    }

    async updatePartner(id: string, partner: Partial<InsertPartner>): Promise<Partner | undefined> {
        const result = await db.update(partners).set(partner).where(eq(partners.id, id)).returning();
        return result[0];
    }

    async deletePartner(id: string): Promise<void> {
        await db.delete(partners).where(eq(partners.id, id));
    }

    // History Milestones
    async getHistoryMilestones(): Promise<HistoryMilestone[]> {
        return db.select().from(historyMilestones).orderBy(historyMilestones.year);
    }

    async createHistoryMilestone(milestone: InsertHistoryMilestone): Promise<HistoryMilestone> {
        const result = await db.insert(historyMilestones).values(milestone).returning();
        return result[0];
    }

    async updateHistoryMilestone(id: string, milestone: Partial<InsertHistoryMilestone>): Promise<HistoryMilestone | undefined> {
        const result = await db.update(historyMilestones).set(milestone).where(eq(historyMilestones.id, id)).returning();
        return result[0];
    }

    async deleteHistoryMilestone(id: string): Promise<void> {
        await db.delete(historyMilestones).where(eq(historyMilestones.id, id));
    }

    // Page Images
    async getPageImages(): Promise<PageImage[]> {
        return db.select().from(pageImages);
    }

    async getPageImagesByPage(pageKey: string): Promise<PageImage[]> {
        return db.select().from(pageImages).where(eq(pageImages.pageKey, pageKey));
    }

    async getPageImage(pageKey: string, imageKey: string): Promise<PageImage | undefined> {
        const result = await db.select().from(pageImages)
            .where(and(eq(pageImages.pageKey, pageKey), eq(pageImages.imageKey, imageKey)));
        return result[0];
    }

    async upsertPageImage(image: InsertPageImage): Promise<PageImage> {
        const existing = await this.getPageImage(image.pageKey, image.imageKey);
        if (existing) {
            const result = await db.update(pageImages)
                .set({ imageUrl: image.imageUrl, altText: image.altText })
                .where(eq(pageImages.id, existing.id))
                .returning();
            return result[0];
        }
        const result = await db.insert(pageImages).values(image).returning();
        return result[0];
    }

    async replacePageImages(pageKey: string, imageKey: string, images: InsertPageImage[]): Promise<PageImage[]> {
        return await db.transaction(async (tx) => {
            await tx.delete(pageImages)
                .where(and(eq(pageImages.pageKey, pageKey), eq(pageImages.imageKey, imageKey)));

            if (images.length === 0) return [];

            const results = await tx.insert(pageImages).values(images).returning();
            return results;
        });
    }

    async deletePageImage(id: string): Promise<void> {
        await db.delete(pageImages).where(eq(pageImages.id, id));
    }

    // Editable Pages
    async getEditablePages(): Promise<EditablePage[]> {
        return db.select().from(editablePages);
    }

    async getEditablePage(slug: string): Promise<EditablePage | undefined> {
        const result = await db.select().from(editablePages).where(eq(editablePages.slug, slug));
        return result[0];
    }

    async upsertEditablePage(page: InsertEditablePage): Promise<EditablePage> {
        const existing = await this.getEditablePage(page.slug);
        if (existing) {
            const result = await db.update(editablePages)
                .set({ ...page, updatedAt: new Date() })
                .where(eq(editablePages.slug, page.slug))
                .returning();
            return result[0];
        }
        const result = await db.insert(editablePages).values(page).returning();
        return result[0];
    }
}
