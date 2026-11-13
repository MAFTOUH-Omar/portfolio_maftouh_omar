import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { dictionaries } from "@/data/dictionaries";
import { fontMono, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

// Two root layouts (fr / en) means no single layout can render unmatched URLs.
export const metadata: Metadata = {
  title: `404 — ${dictionaries.fr.notFound.title}`,
};

export default function GlobalNotFound() {
  const { fr, en } = dictionaries;
  return (
    <html lang="fr-MA">
      <body
        className={cn(
          "flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 text-center font-sans antialiased",
          fontSans.variable, fontMono.variable
        )}
      >
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter">{fr.notFound.title}</h1>
          <p className="text-muted-foreground">{fr.notFound.body}</p>
          <Link href="/" className="text-primary hover:underline">
            {fr.notFound.back}
          </Link>
        </div>
        <div lang="en" className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">{en.notFound.title}</h2>
          <p className="text-muted-foreground">{en.notFound.body}</p>
          <Link href="/en" className="text-primary hover:underline">
            {en.notFound.back}
          </Link>
        </div>
      </body>
    </html>
  );
}
