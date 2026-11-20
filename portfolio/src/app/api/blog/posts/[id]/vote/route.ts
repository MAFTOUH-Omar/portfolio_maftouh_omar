import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { castVote, getPostEngagement, isPublishedPost } from "@/data/engagement";
import { logEngagementError } from "@/lib/db-errors";
import { attachVisitorCookie, isTrustedWrite, resolveVisitor } from "@/lib/visitor";

export const runtime = "nodejs";

const bodySchema = z.object({ value: z.union([z.literal(1), z.literal(-1), z.literal(0)]) });

/** Like (1), dislike (-1) or withdraw (0) — one vote per visitor and post. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isTrustedWrite(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  try {
    if (!(await isPublishedPost(id))) return NextResponse.json({ error: "Not found." }, { status: 404 });
    const visitor = resolveVisitor(request);
    await castVote(id, visitor, parsed.data.value);
    const engagement = await getPostEngagement(id, visitor.hash);
    return attachVisitorCookie(
      NextResponse.json(engagement, { headers: { "Cache-Control": "private, no-store" } }),
      visitor
    );
  } catch (error) {
    logEngagementError("vote", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
