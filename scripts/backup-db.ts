import { exec } from "child_process";
import { uploadToStorage, isS3Configured, isSupabaseStorageConfigured } from "../server/storage_provider";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import dotenv from "dotenv";

dotenv.config();

const execAsync = promisify(exec);

async function backupDatabase() {
    const date = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${date}.sql`;
    const filepath = path.resolve("/tmp", filename);

    console.log(`Starting database backup: ${filename}`);

    if (!process.env.DATABASE_URL) {
        console.error("Error: DATABASE_URL is not defined.");
        process.exit(1);
    }

    try {
        // 1. Create Dump
        // Note: pg_dump must be installed in the environment (Render has it)
        await execAsync(`pg_dump "${process.env.DATABASE_URL}" -f "${filepath}"`);
        console.log("Database dump created successfully.");

        // 2. Upload to Storage (S3 or Supabase)
        if (isS3Configured() || isSupabaseStorageConfigured()) {
            const fileBuffer = fs.readFileSync(filepath);
            // Determine content type (text/plain or application/sql)
            const uploadUrl = await uploadToStorage(fileBuffer, `backups/${filename}`, "application/sql");
            console.log(`Backup uploaded successfully to: ${uploadUrl}`);
        } else {
            console.warn("No persistent storage configured. Backup is saved locally at /tmp, but will be lost on restart.");
            console.log(`Backup content sample:\n` + fs.readFileSync(filepath, 'utf8').substring(0, 200) + "...");
        }

        // 3. Cleanup
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
        console.log("Backup process completed.");

    } catch (error) {
        console.error("Backup failed:", error);
        process.exit(1);
    }
}

backupDatabase();
