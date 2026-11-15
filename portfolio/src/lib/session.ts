import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

/** Server Component / Route Handler only (reads the httpOnly cookie via next/headers). */
export async function getSession() {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}
