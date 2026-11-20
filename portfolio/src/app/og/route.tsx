import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getSiteData } from "@/data/resume";
import { defaultLocale, locales, type Locale } from "@/lib/i18n";

export const runtime = "nodejs";

/**
 * 1200×630 social card (WhatsApp, LinkedIn, X, Slack…), built from ogImageUrl().
 *
 * The art is drawn as flat vector shapes — the hero card's sand diagonal and
 * purple disc on brand ink — rather than a bitmap background: flat colors
 * compress to a few dozen KB, while WhatsApp drops link previews whose image
 * is over ~300 KB. Text stays clear of the shapes at every title length.
 */

const INK = "#14392c"; // --hero-ink  hsl(160 48% 15%)
const SAND = "#edd8b6"; // --hero-panel hsl(38 60% 82%)
const PURPLE = "#9e49e9"; // --hero-disc  hsl(272 78% 60%)

// Outfit, the site font (SIL OFL, assets/fonts/OFL.txt). Satori needs TTF/OTF,
// not the woff2 next/font serves. Read once per server instance.
const fonts = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Outfit-500.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Outfit-700.ttf")),
])
  .then(([medium, bold]) => [
    { name: "Outfit", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Outfit", data: bold, weight: 700 as const, style: "normal" as const },
  ])
  .catch(() => undefined); // fall back to the built-in font rather than fail

/** Printed on the home card, where the title already gives the role. */
const STACK = "Next.js · React · Laravel · NestJS · Node.js";
const MAX_TITLE = 110;

/** Caps the text at a word boundary, with an ellipsis, so it fits the card. */
function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:—–-]+$/, "")}…`;
}

/** Longer titles get a smaller size so they always fit in three lines. */
function titleSize(title: string): number {
  if (title.length <= 32) return 76;
  if (title.length <= 60) return 64;
  if (title.length <= 90) return 54;
  return 46;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = await getSiteData();
  const requested = searchParams.get("l");
  const locale: Locale = locales.includes(requested as Locale) ? (requested as Locale) : defaultLocale;
  // Capped so the endpoint can't be used to render arbitrary long text.
  const title = clamp(searchParams.get("title") ?? data.fullName, MAX_TITLE);
  const label = searchParams.get("label")?.slice(0, 40);
  const domain = data.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          background: INK,
          color: "#ffffff",
          fontFamily: "Outfit",
        }}
      >
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
          <polygon points="790,0 1200,0 1200,300" fill={SAND} />
          <circle cx="60" cy="640" r="210" fill={PURPLE} />
          <circle cx="0" cy="770" r="250" fill={INK} />
        </svg>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            padding: "72px 80px",
          }}
        >
          {/* Who: initials tile + name + domain */}
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: 14,
                background: SAND,
                color: INK,
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {data.initials}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>{data.fullName}</div>
              <div style={{ display: "flex", fontSize: 22, fontWeight: 500, color: "rgba(255,255,255,0.62)" }}>
                {domain}
              </div>
            </div>
          </div>

          {/* What: optional label + title */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 56 }}>
            {label && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: SAND,
                }}
              >
                <div style={{ display: "flex", width: 12, height: 12, borderRadius: 999, background: PURPLE }} />
                {label}
              </div>
            )}
            <div
              style={{
                display: "flex",
                maxWidth: 880,
                fontSize: titleSize(title),
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </div>
          </div>

          {/* Bottom right: the role, or the stack on the home card (whose title is the role) */}
          <div
            style={{
              display: "flex",
              marginTop: "auto",
              justifyContent: "flex-end",
              fontSize: 24,
              fontWeight: 500,
              color: "rgba(255,255,255,0.72)",
            }}
          >
            {label ? data.role[locale] : STACK}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await fonts }
  );
}
