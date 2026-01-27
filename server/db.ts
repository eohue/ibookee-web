import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "🚨 DATABASE_URL environment variable is missing!\n" +
    "This application requires a PostgreSQL connection to function."
  );
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

const isServerless = !!process.env.VERCEL;

const poolConfig = {
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Render/Neon free tier limits are often low (e.g. 10-20). 
  // We set max to 10 to be safe and allow some headroom for migrations/admin connectivity.
  max: isServerless ? 5 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: isServerless ? 10000 : 30000,
  keepAlive: true,
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
  // Don't exit process on idle client error - just log it
  // This helps prevent restart loops on transient connection issues
});

export { pool };
export const db = drizzle(pool, { schema });

// Extend global type
declare global {
  var dbPool: pg.Pool | undefined;
}
