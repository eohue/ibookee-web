import "dotenv/config";
import { db } from "../server/db";
import { projects } from "@shared/schema";

async function main() {
    const allProjects = await db.select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        relatedArticles: projects.relatedArticles
    }).from(projects);

    console.log(JSON.stringify(allProjects, null, 2));
    process.exit(0);
}

main();
