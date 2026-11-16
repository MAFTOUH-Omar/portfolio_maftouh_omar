import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const postStatus = pgEnum("post_status", ["draft", "published"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("users_email_idx").on(table.email)]);

export const loginAttempts = pgTable("login_attempts", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  success: boolean("success").notNull(),
  attemptedAt: timestamp("attempted_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("login_attempts_email_idx").on(table.email, table.attemptedAt)]);

/** Singleton row (id = "singleton") holding the bio/profile shown on the homepage. */
export const profile = pgTable("profile", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  givenName: text("given_name").notNull(),
  familyName: text("family_name").notNull(),
  initials: text("initials").notNull(),
  roleFr: text("role_fr").notNull(),
  roleEn: text("role_en").notNull(),
  descriptionFr: text("description_fr").notNull(),
  descriptionEn: text("description_en").notNull(),
  summaryFr: text("summary_fr").notNull(),
  summaryEn: text("summary_en").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  locationFr: text("location_fr").notNull(),
  locationEn: text("location_en").notNull(),
  locationLink: text("location_link").notNull(),
  addressLocality: text("address_locality").notNull(),
  addressRegion: text("address_region").notNull(),
  addressCountry: text("address_country").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactTel: text("contact_tel"),
  social: jsonb("social").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

/**
 * `technologies`: {name, icon?}[] — tech badges shown on the card.
 * `links`: {kind: "website"|"apiDocs"|"source", href}[] — label/icon for each
 * kind are derived from the shared LINK constant at read time (resume.tsx),
 * not duplicated here.
 * `images`: string[] — gallery shown in the project dialog.
 */
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  href: text("href"),
  datesFr: text("dates_fr").notNull(),
  datesEn: text("dates_en").notNull(),
  descriptionFr: text("description_fr").notNull(),
  descriptionEn: text("description_en").notNull(),
  technologies: jsonb("technologies").notNull().default([]),
  links: jsonb("links").notNull().default([]),
  images: jsonb("images").notNull().default([]),
  active: boolean("active").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const workExperiences = pgTable("work_experiences", {
  id: text("id").primaryKey(),
  company: text("company").notNull(),
  href: text("href"),
  logoUrl: text("logo_url"),
  locationFr: text("location_fr").notNull(),
  locationEn: text("location_en").notNull(),
  titleFr: text("title_fr").notNull(),
  titleEn: text("title_en").notNull(),
  startFr: text("start_fr").notNull(),
  startEn: text("start_en").notNull(),
  endFr: text("end_fr").notNull(),
  endEn: text("end_en").notNull(),
  descriptionFr: text("description_fr").notNull(),
  descriptionEn: text("description_en").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const education = pgTable("education", {
  id: text("id").primaryKey(),
  school: text("school").notNull(),
  href: text("href"),
  logoUrl: text("logo_url"),
  degreeFr: text("degree_fr").notNull(),
  degreeEn: text("degree_en").notNull(),
  start: text("start").notNull(),
  end: text("end"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
}, (table) => [uniqueIndex("tags_slug_idx").on(table.slug)]);

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  locale: text("locale").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  contentMd: text("content_md").notNull(),
  coverImage: text("cover_image"),
  status: postStatus("status").notNull().default("draft"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  createdBy: text("created_by").references(() => users.id),
}, (table) => [uniqueIndex("posts_slug_locale_idx").on(table.slug, table.locale)]);

export const postTags = pgTable("post_tags", {
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => [uniqueIndex("post_tags_pk").on(table.postId, table.tagId)]);

/** No IP column on purpose — country/city come from Vercel's geo headers. */
export const visits = pgTable("visits", {
  id: text("id").primaryKey(),
  path: text("path").notNull(),
  locale: text("locale"),
  referrer: text("referrer"),
  country: text("country"),
  city: text("city"),
  browser: text("browser"),
  os: text("os"),
  device: text("device"),
  language: text("language"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  sessionHash: text("session_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("visits_created_at_idx").on(table.createdAt),
  index("visits_path_idx").on(table.path),
]);
