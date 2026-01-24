import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL must be set for database usage. Falling back to memory storage.");
}

// Supabase requires SSL connection in production
// Supabase requires SSL connection in production
let connectionString = process.env.DATABASE_URL;

// AUTO-FIX: Force Supabase Transaction Mode (Port 6543)
// This resolves "MaxClientsInSessionMode" errors by using PgBouncer which supports thousands of connections
if (connectionString && connectionString.includes('supabase.co') && connectionString.includes(':5432')) {
  console.log('Switching to Supabase Transaction Mode (Port 6543) to prevent connection exhaustion...');
  connectionString = connectionString.replace(':5432', ':6543');
}

const poolConfig = {
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5, // Increased to 5 to handle parallel queries (e.g. admin dashboard). Safe with Transaction Mode.
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout to 10s
};

// Singleton pattern for handling connection pool in serverless environment
let pool: pg.Pool;

if (!global.dbPool) {
  global.dbPool = new Pool(poolConfig);
}
pool = global.dbPool;

// Add error handler to prevent crashing
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export { pool };
export const db = drizzle(pool, { schema });

// Extend global type
declare global {
  var dbPool: pg.Pool | undefined;
}
