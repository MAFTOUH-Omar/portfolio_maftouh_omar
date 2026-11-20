import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { parseUserAgent } from "@/lib/user-agent";

/**
 * Anonymous visitor signature for likes and comments — no account, no raw IP
 * stored anywhere.
 *
 * signature = HMAC-SHA256(SESSION_SECRET, "ip|user-agent")
 *
 * It is then pinned in a signed, httpOnly cookie so the same browser keeps
 * its identity when its IP changes (mobile networks), e.g. to post its one
 * follow-up after the author replied. Clearing cookies on the same network
 * and browser recomputes the same signature, so it doesn't buy a second vote
 * or comment.
 */
const COOKIE = "visitor_sig";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set.");
  return value;
}

function hmac(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

/** First hop of x-forwarded-for (set by Vercel's edge), else x-real-ip. */
function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "0.0.0.0";
}

function cookieMac(hash: string): string {
  return hmac(`cookie:${hash}`).slice(0, 22);
}

function readCookie(request: NextRequest): string | null {
  const raw = request.cookies.get(COOKIE)?.value;
  if (!raw) return null;
  const [hash, mac] = raw.split(".");
  if (!hash || !mac) return null;
  const expected = Buffer.from(cookieMac(hash));
  const given = Buffer.from(mac);
  return expected.length === given.length && timingSafeEqual(expected, given) ? hash : null;
}

export type Visitor = {
  /** Stable pseudonymous signature (base64url, 43 chars). */
  hash: string;
  /** Coarse context stored next to a vote/comment for the admin view. */
  meta: {
    country: string | null;
    city: string | null;
    browser: string | null;
    os: string | null;
    device: string | null;
  };
};

export function resolveVisitor(request: NextRequest): Visitor {
  const userAgent = request.headers.get("user-agent");
  const hash = readCookie(request) ?? hmac(`${clientIp(request)}|${userAgent ?? ""}`);
  const city = request.headers.get("x-vercel-ip-city");
  return {
    hash,
    meta: {
      // Geo headers come from Vercel's edge network; absent locally.
      country: request.headers.get("x-vercel-ip-country"),
      city: city ? decodeURIComponent(city) : null,
      ...parseUserAgent(userAgent),
    },
  };
}

/** Pins the signature on the response (call on every write). */
export function attachVisitorCookie(response: NextResponse, visitor: Visitor): NextResponse {
  response.cookies.set(COOKIE, `${visitor.hash}.${cookieMac(visitor.hash)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return response;
}

/**
 * Write requests must be same-origin JSON: requiring application/json forces
 * a CORS preflight on cross-site fetches, and the Origin check stops another
 * site from making its visitors vote or comment through their IP signature.
 */
export function isTrustedWrite(request: NextRequest): boolean {
  if (!request.headers.get("content-type")?.startsWith("application/json")) return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    return [request.headers.get("x-forwarded-host"), request.headers.get("host")].includes(originHost);
  } catch {
    return false;
  }
}

/** Short form shown in the admin to tell visitors apart. */
export function shortSignature(hash: string | null): string {
  return hash ? hash.slice(0, 8) : "—";
}
