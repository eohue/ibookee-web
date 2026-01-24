import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL must be set for database usage. Falling back to memory storage.");
}

// Supabase requires SSL connection in production
// Supabase requires SSL connection in production
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 1, // Limit connection pool to 1 for serverless environment to prevent 'max clients reached'
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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
