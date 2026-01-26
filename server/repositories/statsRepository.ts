import { eq, count } from "drizzle-orm";
import { db } from "../db";
import {
    projects,
    inquiries,
    articles,
    communityPosts,
    events,
    residentPrograms,
    partners,
    users,
    historyMilestones,
    residentReporters,
    programApplications
} from "@shared/schema";

export class StatsRepository {
    async getStatsCounts() {
        const [
            projectCount,
            inquiryCount,
            articleCount,
            communityPostCount,
            eventCount,
            programCount,
            partnerCount,
            userCount,
            adminCount,
            residentCount,
            milestoneCount,
            reporterArticleCount,
            pendingReporterCount,
            approvedReporterCount,
            programApplicationCount,
            pendingApplicationCount
        ] = await Promise.all([
            db.select({ count: count() }).from(projects),
            db.select({ count: count() }).from(inquiries),
            db.select({ count: count() }).from(articles),
            db.select({ count: count() }).from(communityPosts),
            db.select({ count: count() }).from(events),
            db.select({ count: count() }).from(residentPrograms),
            db.select({ count: count() }).from(partners),
            db.select({ count: count() }).from(users),
            db.select({ count: count() }).from(users).where(eq(users.role, 'admin')),
            db.select({ count: count() }).from(users).where(eq(users.role, 'resident')),
            db.select({ count: count() }).from(historyMilestones),
            db.select({ count: count() }).from(residentReporters),
            db.select({ count: count() }).from(residentReporters).where(eq(residentReporters.status, 'pending')),
            db.select({ count: count() }).from(residentReporters).where(eq(residentReporters.status, 'approved')),
            db.select({ count: count() }).from(programApplications),
            db.select({ count: count() }).from(programApplications).where(eq(programApplications.status, 'pending')),
        ]);

        return {
            projectCount: projectCount[0].count,
            inquiryCount: inquiryCount[0].count,
            articleCount: articleCount[0].count,
            communityPostCount: communityPostCount[0].count,
            eventCount: eventCount[0].count,
            programCount: programCount[0].count,
            partnerCount: partnerCount[0].count,
            userCount: userCount[0].count,
            adminCount: adminCount[0].count,
            residentCount: residentCount[0].count,
            milestoneCount: milestoneCount[0].count,
            reporterArticleCount: reporterArticleCount[0].count,
            pendingReporterCount: pendingReporterCount[0].count,
            approvedReporterCount: approvedReporterCount[0].count,
            applicationCount: programApplicationCount[0].count,
            pendingApplicationCount: pendingApplicationCount[0].count,
        };
    }
}
