CREATE TYPE "public"."post_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "education" (
	"id" text PRIMARY KEY NOT NULL,
	"school" text NOT NULL,
	"href" text,
	"logo_url" text,
	"degree_fr" text NOT NULL,
	"degree_en" text NOT NULL,
	"start" text NOT NULL,
	"end" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"success" boolean NOT NULL,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"post_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"content_md" text NOT NULL,
	"cover_image" text,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"full_name" text NOT NULL,
	"given_name" text NOT NULL,
	"family_name" text NOT NULL,
	"initials" text NOT NULL,
	"role_fr" text NOT NULL,
	"role_en" text NOT NULL,
	"description_fr" text NOT NULL,
	"description_en" text NOT NULL,
	"summary_fr" text NOT NULL,
	"summary_en" text NOT NULL,
	"avatar_url" text NOT NULL,
	"location_fr" text NOT NULL,
	"location_en" text NOT NULL,
	"location_link" text NOT NULL,
	"address_locality" text NOT NULL,
	"address_region" text NOT NULL,
	"address_country" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_tel" text,
	"social" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"href" text,
	"dates_fr" text NOT NULL,
	"dates_en" text NOT NULL,
	"description_fr" text NOT NULL,
	"description_en" text NOT NULL,
	"technologies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_fr" text NOT NULL,
	"name_en" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visits" (
	"id" text PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"locale" text,
	"referrer" text,
	"country" text,
	"city" text,
	"browser" text,
	"os" text,
	"device" text,
	"session_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_experiences" (
	"id" text PRIMARY KEY NOT NULL,
	"company" text NOT NULL,
	"href" text,
	"logo_url" text,
	"location_fr" text NOT NULL,
	"location_en" text NOT NULL,
	"title_fr" text NOT NULL,
	"title_en" text NOT NULL,
	"start_fr" text NOT NULL,
	"start_en" text NOT NULL,
	"end_fr" text NOT NULL,
	"end_en" text NOT NULL,
	"description_fr" text NOT NULL,
	"description_en" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "login_attempts_email_idx" ON "login_attempts" USING btree ("email","attempted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "post_tags_pk" ON "post_tags" USING btree ("post_id","tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_locale_idx" ON "posts" USING btree ("slug","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "visits_created_at_idx" ON "visits" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "visits_path_idx" ON "visits" USING btree ("path");