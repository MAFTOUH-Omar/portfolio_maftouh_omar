import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { loginAttempts } from "@/db/schema";
import { newId } from "@/lib/id";

const WINDOW_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 5;

/** True when `email` has too many recent failed logins and must wait. */
export async function isLoginRateLimited(email: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000);
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.email, email),
        eq(loginAttempts.success, false),
        gte(loginAttempts.attemptedAt, since)
      )
    );
  return Number(rows[0]?.count ?? 0) >= MAX_FAILED_ATTEMPTS;
}

export async function recordLoginAttempt(email: string, success: boolean): Promise<void> {
  await db.insert(loginAttempts).values({ id: newId(), email, success });
}
