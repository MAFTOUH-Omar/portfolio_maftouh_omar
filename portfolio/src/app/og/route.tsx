import { ImageResponse } from "next/og";
import { getSiteData } from "@/data/resume";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = await getSiteData();
  // Capped so the endpoint can't be used to render arbitrary long text.
  const title = (searchParams.get("title") ?? data.fullName).slice(0, 120);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#a1a1aa",
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
            color: "#71717a",
          }}
        >
          {data.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
