
import { pool } from "../db";

export async function runSafeMigration() {
    console.log("Starting safe manual migration check...");
    const client = await pool.connect();
    try {
        // 1. Check and Add 'is_live' column to projects
        const checkIsLive = await client.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name='projects' AND column_name='is_live'`
        );
        if (checkIsLive.rows.length === 0) {
            console.log("Adding missing column: is_live to projects");
            await client.query(`ALTER TABLE projects ADD COLUMN is_live BOOLEAN DEFAULT false`);
        }

        // 2. Check and Add 'rent_status' column to projects
        const checkRentStatus = await client.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name='projects' AND column_name='rent_status'`
        );
        if (checkRentStatus.rows.length === 0) {
            console.log("Adding missing column: rent_status to projects");
            await client.query(`ALTER TABLE projects ADD COLUMN rent_status TEXT DEFAULT 'available'`);
        }

        // 3. Create 'live_project_details' table if not exists
        await client.query(`
      CREATE TABLE IF NOT EXISTS live_project_details (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id VARCHAR NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        hero_image TEXT,
        hero_slogan TEXT,
        concept_title TEXT,
        concept_text TEXT,
        room_types JSONB,
        community_images JSONB,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
        console.log("Verified table: live_project_details");

        // 4. Check and Add 'preferred_project' column to inquiries
        const checkPreferredProject = await client.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name='inquiries' AND column_name='preferred_project'`
        );
        if (checkPreferredProject.rows.length === 0) {
            console.log("Adding missing column: preferred_project to inquiries");
            await client.query(`ALTER TABLE inquiries ADD COLUMN preferred_project TEXT`);
        }

        // 5. Check and Add 'posted_at' column to resident_reporters
        const checkPostedAt = await client.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name='resident_reporters' AND column_name='posted_at'`
        );
        if (checkPostedAt.rows.length === 0) {
            console.log("Adding missing column: posted_at to resident_reporters");
            await client.query(`ALTER TABLE resident_reporters ADD COLUMN posted_at TIMESTAMP DEFAULT NOW()`);
        }

    } catch (error) {
        console.error("Safe migration failed:", error);
        // Don't throw, let the app try to start anyway, or throw if critical?
        // In this case, better to log and proceed, but errors might occur later.
    } finally {
        client.release();
    }
}
