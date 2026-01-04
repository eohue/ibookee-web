
import { db } from "./db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Running migration to add 'role' column...");
    try {
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' NOT NULL`);
        console.log("Migration successful: Added 'role' column.");
    } catch (error) {
        console.error("Migration failed:", error);
    }
    process.exit(0);
}

main();
