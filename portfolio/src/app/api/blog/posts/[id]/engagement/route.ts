import { NextRequest, NextResponse } from "next/server";
import { getPostEngagement, isPublishedPost } from "@/data/engagement";
import { logEngagementError } from "@/lib/db-errors";
import { resolveVisitor } from "@/lib/visitor";

export const runtime = "nodejs";

/** Score, the visitor's own vote, and the comment threads they may see. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!(await isPublishedPost(id))) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const visitor = resolveVisitor(request);
    const engagement = await getPostEngagement(id, visitor.hash);
    return NextResponse.json(engagement, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    logEngagementError("post engagement", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
