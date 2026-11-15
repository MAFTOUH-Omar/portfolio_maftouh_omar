import { getDictionary } from "@/data/dictionaries";
import { getSiteData } from "@/data/resume";
import type { MetadataRoute } from "next";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = getDictionary("fr");
  const data = await getSiteData();
  return {
    name: t.meta.title,
    short_name: data.fullName,
    description: t.meta.description,
    lang: "fr-MA",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#14392c",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
