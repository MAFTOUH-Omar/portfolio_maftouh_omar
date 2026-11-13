import type { Metadata } from "next";
import { getDictionary } from "@/data/dictionaries";
import { DATA } from "@/data/resume";
import { localeConfig, locales, type Locale } from "@/lib/i18n";
import { absoluteUrl, SITE_URL } from "@/lib/site";

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** 1200×630 social card rendered by app/og/route.tsx. */
export function ogImageUrl(title: string): string {
  return `/og?title=${encodeURIComponent(title)}`;
}

/**
 * Site-wide defaults for a locale's root layout. Pages override title,
 * description, canonical and hreflang.
 */
export function rootMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);
  const image = {
    url: ogImageUrl(t.meta.ogTitle),
    width: 1200,
    height: 630,
    alt: t.meta.title,
  };

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t.meta.title,
      template: `%s | ${DATA.fullName}`,
    },
    description: t.meta.description,
    keywords: [...t.meta.keywords],
    authors: [{ name: DATA.fullName, url: SITE_URL }],
    creator: DATA.fullName,
    applicationName: DATA.fullName,
    category: "technology",
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      siteName: DATA.fullName,
      locale: localeConfig[locale].ogLocale,
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => localeConfig[l].ogLocale),
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    // Set these in Vercel → Settings → Environment Variables only if you verify
    // Search Console / Bing with the HTML-tag method (DNS verification needs neither).
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      other: process.env.BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
        : undefined,
    },
  };
}

/**
 * Page-level openGraph. Next replaces (not merges) the layout's openGraph
 * object, so every page must carry the full set of fields.
 */
export function openGraphFor(
  locale: Locale,
  overrides: NonNullable<Metadata["openGraph"]>
): NonNullable<Metadata["openGraph"]> {
  return { ...rootMetadata(locale).openGraph, ...overrides } as NonNullable<
    Metadata["openGraph"]
  >;
}

/** Person entity shared by the home page graph and blog post authorship. */
export function personSchema(locale: Locale) {
  const role = DATA.role[locale];
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: DATA.fullName,
    alternateName: DATA.name,
    givenName: DATA.givenName,
    familyName: DATA.familyName,
    url: SITE_URL,
    image: absoluteUrl(DATA.avatarUrl),
    jobTitle: role,
    description: DATA.summary[locale],
    address: {
      "@type": "PostalAddress",
      addressLocality: DATA.address.locality,
      addressRegion: DATA.address.region,
      addressCountry: DATA.address.country,
    },
    hasOccupation: {
      "@type": "Occupation",
      name: role,
      occupationLocation: {
        "@type": "City",
        name: DATA.address.locality,
        containedInPlace: { "@type": "Country", name: "Morocco" },
      },
      skills: DATA.skills.map((s) => s.name).join(", "),
    },
    knowsAbout: DATA.skills.map((s) => s.name),
    knowsLanguage: locales.map((l) => localeConfig[l].hreflang),
    worksFor: { "@type": "Organization", name: DATA.work[0].company },
    alumniOf: DATA.education.map((e) => ({
      "@type": "EducationalOrganization",
      name: e.school,
      ...(e.href ? { url: e.href } : {}),
    })),
    sameAs: Object.entries(DATA.contact.social)
      .filter(([key]) => key !== "email")
      .map(([, social]) => social.url),
  };
}
