CREATE TYPE "public"."comment_author" AS ENUM('visitor', 'admin');--> statement-breakpoint
CREATE TYPE "public"."comment_status" AS ENUM('pending', 'approved', 'hidden');--> statement-breakpoint
CREATE TABLE "post_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"parent_id" text,
	"author_type" "comment_author" NOT NULL,
	"author_name" text,
	"visitor_hash" text,
	"body" text NOT NULL,
	"status" "comment_status" DEFAULT 'pending' NOT NULL,
	"country" text,
	"city" text,
	"browser" text,
	"os" text,
	"device" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"visitor_hash" text NOT NULL,
	"value" smallint NOT NULL,
	"country" text,
	"city" text,
	"browser" text,
	"os" text,
	"device" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parent_id_post_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."post_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_votes" ADD CONSTRAINT "post_votes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_comments_post_idx" ON "post_comments" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE INDEX "post_comments_parent_idx" ON "post_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_comments_one_root_idx" ON "post_comments" USING btree ("post_id","visitor_hash") WHERE "post_comments"."parent_id" is null and "post_comments"."author_type" = 'visitor';--> statement-breakpoint
CREATE UNIQUE INDEX "post_comments_one_followup_idx" ON "post_comments" USING btree ("parent_id") WHERE "post_comments"."parent_id" is not null and "post_comments"."author_type" = 'visitor';--> statement-breakpoint
CREATE UNIQUE INDEX "post_votes_post_visitor_idx" ON "post_votes" USING btree ("post_id","visitor_hash");--> statement-breakpoint
CREATE INDEX "post_votes_created_at_idx" ON "post_votes" USING btree ("created_at");