import { eq, desc, count, arrayContains, sql } from "drizzle-orm";
import { db } from "../db";
import {
    projects,
    subprojects,
    projectImages,
    type Project,
    type InsertProject,
    type Subproject,
    type InsertSubproject,
    type ProjectImage,
    type InsertProjectImage
} from "@shared/schema";

export class ProjectRepository {
    async getProjects(page: number = 1, limit: number = 100, titles?: string[]): Promise<{ projects: Project[], total: number }> {
        const offset = (page - 1) * limit;

        const [projectsResult, countResult] = await Promise.all([
            db.select({
                id: projects.id,
                title: projects.title,
                titleEn: projects.titleEn,
                location: projects.location,
                category: projects.category,
                imageUrl: projects.imageUrl,
                year: projects.year,
                completionMonth: projects.completionMonth,
                units: projects.units,
                siteArea: projects.siteArea,
                grossFloorArea: projects.grossFloorArea,
                scale: projects.scale,
                featured: projects.featured,
                partnerLogos: projects.partnerLogos,
                pdfUrl: projects.pdfUrl,
                description: projects.description,
                relatedArticles: projects.relatedArticles,
            })
                .from(projects)
                // Add conditional where clause
                .where(titles && titles.length > 0
                    ? sql`${projects.title} IN ${titles}`
                    : undefined)
                .orderBy(desc(projects.year))
                .limit(limit)
                .offset(offset),

            db.select({ count: count() })
                .from(projects)
                .where(titles && titles.length > 0
                    ? sql`${projects.title} IN ${titles}`
                    : undefined)
        ]);

        return {
            projects: projectsResult,
            total: countResult[0]?.count || 0
        };
    }

    async getProject(id: string): Promise<Project | undefined> {
        const result = await db.select().from(projects).where(eq(projects.id, id));
        return result[0];
    }

    async getProjectsByCategory(category: string): Promise<Project[]> {
        return db.select().from(projects)
            .where(arrayContains(projects.category, [category]))
            .orderBy(sql`${projects.year} DESC`);
    }

    async createProject(project: InsertProject): Promise<Project> {
        const result = await db.insert(projects).values(project).returning();
        return result[0];
    }

    async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
        const result = await db.update(projects).set(project).where(eq(projects.id, id)).returning();
        return result[0];
    }

    async deleteProject(id: string): Promise<void> {
        await db.delete(projects).where(eq(projects.id, id));
    }

    // Subprojects implementation
    async getSubprojects(parentProjectId: string): Promise<Subproject[]> {
        return db.select().from(subprojects)
            .where(eq(subprojects.parentProjectId, parentProjectId))
            .orderBy(subprojects.displayOrder);
    }

    async getSubproject(id: string): Promise<Subproject | undefined> {
        const result = await db.select().from(subprojects).where(eq(subprojects.id, id));
        return result[0];
    }

    async createSubproject(subproject: InsertSubproject): Promise<Subproject> {
        const result = await db.insert(subprojects).values(subproject).returning();
        return result[0];
    }

    async updateSubproject(id: string, subproject: Partial<InsertSubproject>): Promise<Subproject | undefined> {
        const result = await db.update(subprojects).set(subproject).where(eq(subprojects.id, id)).returning();
        return result[0];
    }

    async deleteSubproject(id: string): Promise<void> {
        await db.delete(subprojects).where(eq(subprojects.id, id));
    }

    // Project Images implementation
    async getProjectImages(projectId: string): Promise<ProjectImage[]> {
        return db.select().from(projectImages).where(eq(projectImages.projectId, projectId));
    }

    async createProjectImage(image: InsertProjectImage): Promise<ProjectImage> {
        const result = await db.insert(projectImages).values(image).returning();
        return result[0];
    }

    async deleteProjectImage(id: string): Promise<void> {
        await db.delete(projectImages).where(eq(projectImages.id, id));
    }
}
