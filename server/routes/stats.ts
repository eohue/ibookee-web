import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerStatsRoutes(app: Express) {
    app.get("/api/admin/stats", isAuthenticated, async (_req, res) => {
        try {
            const [
                projects,
                inquiries,
                articles,
                communityPosts,
                events,
                programs,
                partners,
                users,
                milestones,
                reporterArticles,
                applications
            ] = await Promise.all([
                storage.getProjects(),
                storage.getInquiries(),
                storage.getArticles(),
                storage.getCommunityPosts(1, 1),
                storage.getEvents(),
                storage.getResidentPrograms(),
                storage.getPartners(),
                storage.getUsers(),
                storage.getHistoryMilestones(),
                storage.getReporterArticles(),
                storage.getProgramApplications(),
            ]);

            // Get pending counts
            const pendingReporterArticles = reporterArticles.filter(a => a.status === 'pending');
            const approvedReporterArticles = reporterArticles.filter(a => a.status === 'approved');
            const pendingApplications = applications.filter(a => a.status === 'pending');

            // Get user role breakdown
            const adminUsers = users.filter(u => u.role === 'admin');
            const residentUsers = users.filter(u => u.role === 'resident');

            res.json({
                projectCount: projects.length,
                inquiryCount: inquiries.length,
                articleCount: articles.length,
                communityPostCount: communityPosts.total,
                eventCount: events.length,
                programCount: programs.length,
                partnerCount: partners.length,
                userCount: users.length,
                adminCount: adminUsers.length,
                residentCount: residentUsers.length,
                milestoneCount: milestones.length,
                reporterArticleCount: reporterArticles.length,
                pendingReporterCount: pendingReporterArticles.length,
                approvedReporterCount: approvedReporterArticles.length,
                applicationCount: applications.length,
                pendingApplicationCount: pendingApplications.length,
            });
        } catch (error: any) {
            console.error("Stats fetch error:", error);
            res.status(500).json({
                error: "Failed to fetch stats",
                details: error.message,
                code: error.code
            });
        }
    });
}
