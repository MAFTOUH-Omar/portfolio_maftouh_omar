import { NextRequest, NextResponse } from "next/server";
import { getBlogPostsPage } from "@/data/blog";
import { describeDbError } from "@/lib/db-errors";
import { locales, type Locale } from "@/lib/i18n";

const MAX_PAGE_SIZE = 10;

function isLocale(value: string | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Backs the blog index's infinite scroll: one page of published posts
 *  (metadata only, no markdown render) at a time, capped at 10. */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get("locale");
  const offset = Number(searchParams.get("offset") ?? "0");
  const limit = Math.min(MAX_PAGE_SIZE, Number(searchParams.get("limit") ?? String(MAX_PAGE_SIZE)));
  const q = searchParams.get("q") ?? undefined;

  if (!isLocale(locale) || !Number.isFinite(offset) || offset < 0 || !Number.isFinite(limit) || limit <= 0) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const { posts, hasMore } = await getBlogPostsPage(locale, offset, limit, q);
    return NextResponse.json({ posts, hasMore });
  } catch (error) {
    // Usually a dropped DB connection; the client retries. Log the driver's
    // reason, not just Drizzle's "Failed query" line.
    console.error(`[blog] posts page (offset ${offset}): ${describeDbError(error)}`);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
