
import { db } from "../server/db";
import { projects } from "../shared/schema";

async function main() {
    console.log("Checking database connection and projects...");
    try {
        const result = await db.select().from(projects);
        console.log(`Found ${result.length} projects.`);
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error querying projects:", error);
    }
    process.exit(0);
}

main();
