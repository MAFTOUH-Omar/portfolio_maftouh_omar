import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { SESSION_COOKIE, sessionCookieOptions, signSession, verifyPassword } from "@/lib/auth";
import { isLoginRateLimited, recordLoginAttempt } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase().trim();
  const { password } = parsed.data;

  if (await isLoginRateLimited(email)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 }
    );
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  await recordLoginAttempt(email, valid);

  if (!user || !valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await signSession({ sub: user.id, email: user.email });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
