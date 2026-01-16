import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

async function checkTables() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        // List all tables
        const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

        console.log("=== All Tables in Database ===");
        tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));

        // Specifically check for resident_reporters
        const residentReportersResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'resident_reporters'
      ) as exists
    `);

        console.log("\n=== resident_reporters Table Check ===");
        console.log(`Table exists: ${residentReportersResult.rows[0].exists}`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await pool.end();
    }
}

checkTables();
