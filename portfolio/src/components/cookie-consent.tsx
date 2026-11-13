"use client";

import { Analytics } from "@vercel/analytics/next";
import { Cookie } from "lucide-react";
import { useSyncExternalStore } from "react";

type Consent = "accepted" | "rejected";

const STORAGE_KEY = "cookie-consent";
const CHANGE_EVENT = "cookie-consent-change";

/** In-memory fallback when storage is blocked (private mode, strict settings). */
let memoryConsent: Consent | null = null;

function readConsent(): Consent | "unset" {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "accepted" || stored === "rejected") return stored;
  } catch {
    // Storage unavailable: fall through to the in-memory value.
  }
  return memoryConsent ?? "unset";
}

function saveConsent(value: Consent) {
  memoryConsent = value;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Kept in memory for this page view only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

interface Props {
  labels: { title: string; text: string; accept: string; reject: string };
}

/**
 * First-visit consent banner. Vercel Analytics only loads after "Accept";
 * the choice is remembered in localStorage. Renders nothing on the server,
 * so it never affects the static HTML or hydration.
 */
export function CookieConsent({ labels }: Props) {
  const consent = useSyncExternalStore(subscribe, readConsent, () => "ssr" as const);

  return (
    <>
      {consent === "accepted" && <Analytics />}
      {consent === "unset" && (
        <div
          role="region"
          aria-label={labels.title}
          className="cookie-banner fixed inset-x-4 bottom-24 z-50 rounded-xl sm:right-auto sm:max-w-sm xl:bottom-6 xl:left-6 border border-border bg-background/95 p-4 backdrop-blur-md"
        >
          <div className="flex gap-3">
            <Cookie aria-hidden className="mt-0.5 size-5 flex-shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{labels.title}</p>
              <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">
                {labels.text}
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => saveConsent("rejected")}
              className="rounded-full border border-border px-4 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              {labels.reject}
            </button>
            <button
              type="button"
              onClick={() => saveConsent("accepted")}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {labels.accept}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
