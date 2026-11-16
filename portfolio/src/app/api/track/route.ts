import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { visits } from "@/db/schema";
import { newId } from "@/lib/id";
import { parseUserAgent } from "@/lib/user-agent";

export const runtime = "nodejs";

const SESSION_COOKIE = "visitor_session";
const SESSION_MAX_AGE = 60 * 30; // 30 minutes of inactivity = a new "session".

const bodySchema = z.object({
  path: z.string().max(500),
  referrer: z.string().max(500).optional(),
  language: z.string().max(35).optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { path, referrer, language, utmSource, utmMedium, utmCampaign } = parsed.data;
  const locale = path === "/en" || path.startsWith("/en/") ? "en" : "fr";

  // Geo headers are populated by Vercel's edge network; absent locally. No
  // raw IP is ever read or stored here.
  const country = request.headers.get("x-vercel-ip-country");
  const city = request.headers.get("x-vercel-ip-city");
  const { browser, os, device } = parseUserAgent(request.headers.get("user-agent"));

  let sessionHash = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionHash) sessionHash = crypto.randomUUID();

  await db.insert(visits).values({
    id: newId(),
    path,
    locale,
    referrer: referrer || null,
    country: country || null,
    city: city ? decodeURIComponent(city) : null,
    browser,
    os,
    device,
    language: language || null,
    utmSource: utmSource || null,
    utmMedium: utmMedium || null,
    utmCampaign: utmCampaign || null,
    sessionHash,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, sessionHash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
