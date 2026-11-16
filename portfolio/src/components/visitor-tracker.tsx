"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useConsent } from "@/components/cookie-consent";

/** First-party page-view beacon. Fires only once the visitor has accepted
 *  cookies, mirroring the gate already in place for Vercel Analytics. */
export function VisitorTracker() {
  const consent = useConsent();
  const pathname = usePathname();

  useEffect(() => {
    if (consent !== "accepted") return;

    const params = new URLSearchParams(window.location.search);

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || undefined,
        language: navigator.language || undefined,
        utmSource: params.get("utm_source") || undefined,
        utmMedium: params.get("utm_medium") || undefined,
        utmCampaign: params.get("utm_campaign") || undefined,
      }),
      keepalive: true,
    }).catch(() => {
      // Analytics beacon: failures are silently ignored.
    });
  }, [consent, pathname]);

  return null;
}
