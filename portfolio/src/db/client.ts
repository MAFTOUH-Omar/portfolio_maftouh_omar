import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

/**
 * Single pooled connection, reused across requests on the same Node runtime
 * instance (drizzle-orm/neon-serverless, so db.transaction() works, unlike
 * the plain neon-http driver).
 */
const globalForDb = globalThis as unknown as { _pool?: Pool };

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — add it to .env.local (Neon connection string).");
  }
  if (!globalForDb._pool) {
    globalForDb._pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return globalForDb._pool;
}

export const db = drizzle(getPool(), { schema });
