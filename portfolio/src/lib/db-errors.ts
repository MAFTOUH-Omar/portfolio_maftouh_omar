/**
 * Helpers for Postgres errors surfaced through Drizzle. Drizzle wraps the
 * driver error in a "Failed query: …" error whose `cause` carries the real
 * reason (SQLSTATE `code` + message), so walk the cause chain.
 */

function causes(error: unknown): unknown[] {
  const chain: unknown[] = [];
  let current = error;
  // Bounded: a cause chain is short, and this guards against cycles.
  for (let depth = 0; current && depth < 5; depth++) {
    chain.push(current);
    current = (current as { cause?: unknown }).cause;
  }
  return chain;
}

/** SQLSTATE code of the underlying Postgres error, if any. */
export function pgErrorCode(error: unknown): string | undefined {
  for (const item of causes(error)) {
    const code = (item as { code?: unknown }).code;
    if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) return code;
  }
  return undefined;
}

/** 42P01 undefined_table — e.g. a migration that hasn't been applied yet. */
export function isMissingTable(error: unknown): boolean {
  return pgErrorCode(error) === "42P01";
}

/** One readable line: the driver's own message rather than Drizzle's SQL dump. */
export function describeDbError(error: unknown): string {
  const chain = causes(error);
  const root = chain[chain.length - 1];
  const message = root instanceof Error ? root.message : String(root);
  const code = pgErrorCode(error);
  return code ? `${message} (SQLSTATE ${code})` : message;
}

let warnedMissingEngagement = false;

/**
 * Logs an engagement (likes/comments) failure once, clearly: the usual cause
 * is drizzle/0002_post_engagement.sql not applied yet (`npm run db:migrate`).
 */
export function logEngagementError(scope: string, error: unknown) {
  if (isMissingTable(error)) {
    if (warnedMissingEngagement) return;
    warnedMissingEngagement = true;
    console.warn(
      `[engagement] ${scope}: tables post_votes / post_comments are missing — run \`npm run db:migrate\` (drizzle/0002_post_engagement.sql).`
    );
    return;
  }
  console.error(`[engagement] ${scope}: ${describeDbError(error)}`);
}
