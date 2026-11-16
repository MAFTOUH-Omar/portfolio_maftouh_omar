import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";
import { SectionHeading } from "@/components/section-heading";
import { CopyEmailButton } from "@/components/copy-email-button";
import { getDictionary } from "@/data/dictionaries";
import { getSiteData } from "@/data/resume";
import type { Locale } from "@/lib/i18n";

const secondaryCta =
  "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:border-white/40 hover:bg-white/10";

/**
 * "Let's work together" CTA — the hero card art mirrored at the end of a
 * page. Shared by the home page and every blog view (index, post, tag) so
 * the invite to reach out is never a dead end on the content pages.
 */
export async function ContactCta({
  locale,
  index = "06",
  showHeading = true,
}: {
  locale: Locale;
  index?: string;
  /** The home page numbers this among its sections; the blog views just
   *  want the card on its own, with no "0X Contact" heading above it. */
  showHeading?: boolean;
}) {
  const t = getDictionary(locale);
  const data = await getSiteData();

  return (
    <section
      id="contact"
      className="-mx-6 flex flex-col gap-y-6 px-6 pt-4 pb-16 [content-visibility:auto] [contain-intrinsic-size:auto_480px]"
    >
      {showHeading && <SectionHeading index={index} title={t.contact.title} />}
      <BlurFade delay={0.04}>
        {/* Bookends the page: same card art as the hero, mirrored. */}
        <div className="relative isolate overflow-hidden rounded-lg bg-hero-ink px-6 py-12 text-center text-white sm:px-12 sm:py-16 dark:ring-1 dark:ring-white/10">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-hero-panel [clip-path:polygon(0_78%,0_100%,34%_100%)] sm:[clip-path:polygon(0_45%,0_100%,30%_100%)]" />
            <div className="absolute -right-20 -top-20 size-56 rounded-full bg-hero-disc sm:size-72" />
            <div className="absolute -right-20 -top-20 size-56 translate-x-12 translate-y-14 rounded-full bg-hero-ink sm:size-72" />
          </div>
          <h3 className="text-balance text-3xl font-bold tracking-tighter sm:text-5xl">
            {t.contact.headline}
          </h3>
          <p className="mx-auto mt-4 max-w-md text-pretty text-white/75 sm:text-lg">
            {t.contact.body}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={data.contact.social.email.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-sm font-medium text-hero-ink transition-colors hover:bg-hero-panel"
            >
              {t.contact.email}
              <span className="flex size-8 items-center justify-center rounded-full bg-hero-ink text-white transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
            <CopyEmailButton
              email={data.contact.email}
              label={t.contact.copy}
              copiedLabel={t.contact.copied}
              className={secondaryCta}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={data.contact.social.LinkedIn.url}
              target="_blank"
              rel="noopener noreferrer"
              className={secondaryCta}
            >
              <data.contact.social.LinkedIn.icon className="size-4" />
              LinkedIn
            </Link>
            <a href="/cv-maftouh-omar.pdf" download className={secondaryCta}>
              <Download className="size-4" />
              {t.contact.cv}
            </a>
          </div>
        </div>
      </BlurFade>
    </section>
  );
}
