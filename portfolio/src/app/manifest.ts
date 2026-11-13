import { getDictionary } from "@/data/dictionaries";
import { DATA } from "@/data/resume";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const t = getDictionary("fr");
  return {
    name: t.meta.title,
    short_name: DATA.fullName,
    description: t.meta.description,
    lang: "fr-MA",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#14392c",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
