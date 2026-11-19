import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getSiteData } from "@/data/resume";

/**
 * Branded background art, dropped in manually at public/og-bg.png (see the
 * image prompt in the PR/commit that added this). Read once per server
 * instance and inlined as a data URI — `next/og`'s Satori renderer can't
 * resolve a relative /public path at request time. Falls back to a flat
 * brand-green card until the file exists.
 */
const ogBackground = (() => {
  try {
    const file = fs.readFileSync(path.join(process.cwd(), "public", "og-bg.png"));
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch {
    return null;
  }
})();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = await getSiteData();
  // Capped so the endpoint can't be used to render arbitrary long text.
  const title = (searchParams.get("title") ?? data.fullName).slice(0, 120);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#14392c",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        {ogBackground && (
          // eslint-disable-next-line @next/next/no-img-element -- Satori needs a plain <img>, not next/image.
          <img
            src={ogBackground}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "80px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#d4d4d8",
              letterSpacing: "-0.02em",
            }}
          >
            {data.fullName}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              maxWidth: "900px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#a1a1aa",
            }}
          >
            {data.url.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
