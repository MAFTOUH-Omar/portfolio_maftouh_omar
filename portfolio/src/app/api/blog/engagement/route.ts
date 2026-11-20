import { NextRequest, NextResponse } from "next/server";
import { getCardStats } from "@/data/engagement";
import { logEngagementError } from "@/lib/db-errors";
import { resolveVisitor } from "@/lib/visitor";

export const runtime = "nodejs";

const MAX_IDS = 30;

/**
 * Score, comment count and the visitor's own vote for a batch of posts (the
 * vote widget on post cards). Visitor-specific, so never cached.
 */
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, MAX_IDS);

  try {
    const stats = await getCardStats(ids, resolveVisitor(request).hash);
    return NextResponse.json({ stats }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    logEngagementError("card stats", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
