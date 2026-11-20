import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addComment, addFollowUp, getPostEngagement, isPublishedPost } from "@/data/engagement";
import { logEngagementError } from "@/lib/db-errors";
import { attachVisitorCookie, isTrustedWrite, resolveVisitor } from "@/lib/visitor";

export const runtime = "nodejs";

/** Strips control characters (keeps newlines and tabs) and trims. */
function clean(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

const bodySchema = z.object({
  name: z.string().max(60).optional(),
  body: z.string().max(2000),
  /** Root comment id when posting the visitor's follow-up. */
  parentId: z.string().max(64).optional(),
  /** Honeypot: hidden from people, filled in by naive bots. */
  website: z.string().max(200).optional(),
});

const STATUS: Record<string, number> = {
  rate_limited: 429,
  already_commented: 409,
  not_allowed: 403,
};

/** A visitor's one comment on a post, or their one follow-up to the author's reply. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isTrustedWrite(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const visitor = resolveVisitor(request);
  const body = clean(parsed.data.body);
  const name = clean(parsed.data.name ?? "") || null;

  try {
    if (!(await isPublishedPost(id))) return NextResponse.json({ error: "not_found" }, { status: 404 });

    // Bots get a normal-looking answer and nothing is stored.
    if (!parsed.data.website) {
      if (body.length < 2) return NextResponse.json({ error: "invalid" }, { status: 400 });
      const error = parsed.data.parentId
        ? await addFollowUp(id, parsed.data.parentId, visitor, body)
        : await addComment(id, visitor, name, body);
      if (error) return NextResponse.json({ error }, { status: STATUS[error] ?? 400 });
    }

    const engagement = await getPostEngagement(id, visitor.hash);
    return attachVisitorCookie(
      NextResponse.json(engagement, { status: 201, headers: { "Cache-Control": "private, no-store" } }),
      visitor
    );
  } catch (error) {
    logEngagementError("comment", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
