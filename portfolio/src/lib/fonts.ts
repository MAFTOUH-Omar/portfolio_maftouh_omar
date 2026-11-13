import { Geist_Mono, Outfit } from "next/font/google";

export const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
});

/** Used for small "code" accents: section numbers, dates, tags. */
export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-loaded",
});
