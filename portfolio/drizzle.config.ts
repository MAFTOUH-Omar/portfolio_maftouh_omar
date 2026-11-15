import process from "node:process";
import { defineConfig } from "drizzle-kit";

// drizzle-kit is a standalone CLI (not Next.js), so .env.local isn't loaded
// automatically — load it ourselves (Node 20.6+ built-in, no extra dep).
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local may not exist yet, or DATABASE_URL is already in the shell env.
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — add it to .env.local before running drizzle-kit.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
});
