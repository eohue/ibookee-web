import pg from "pg";

const { Pool } = pg;

async function checkRenderDB() {
    const pool = new Pool({
        connectionString: "postgresql://admin:CQb5rgk2VyGcWwJNR442O4wGTbONVVqr@dpg-d5j4urer433s738tpjig-a.singapore-postgres.render.com/ibookee_db",
        ssl: { rejectUnauthorized: false }
    });

    try {
        // Check for resident_reporters table
        const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'resident_reporters'
      ) as exists
    `);

        console.log("=== Render DB: resident_reporters Table Check ===");
        console.log(`Table exists: ${result.rows[0].exists}`);

        if (result.rows[0].exists) {
            // Get table columns
            const columnsResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'resident_reporters'
        ORDER BY ordinal_position
      `);
            console.log("\nTable columns:");
            columnsResult.rows.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await pool.end();
    }
}

checkRenderDB();
