import { and, desc, eq } from "drizzle-orm";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import { db } from "@/db/client";
import { postTags, posts, tags } from "@/db/schema";
import { newId } from "@/lib/id";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

const localeSchema = z.enum(["fr", "en"]);
const statusSchema = z.enum(["draft", "published"]);

/** Resolves free-text tag names to tag ids, creating any that don't exist yet
 *  (slug derived from the name; translations default to the given name and
 *  can be refined later in /admin/tags). */
async function resolveTagIds(names: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const rawName of names) {
    const name = rawName.trim();
    if (!name) continue;
    const slug = slugify(name);
    const [existing] = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
    if (existing) {
      ids.push(existing.id);
      continue;
    }
    const id = newId();
    await db.insert(tags).values({ id, slug, nameFr: name, nameEn: name });
    ids.push(id);
  }
  return ids;
}

async function syncPostTags(postId: string, tagIds: string[]) {
  await db.delete(postTags).where(eq(postTags.postId, postId));
  if (tagIds.length > 0) {
    await db.insert(postTags).values(tagIds.map((tagId) => ({ postId, tagId })));
  }
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_tags",
      {
        title: "List tags",
        description: "List every tag available for blog posts on the portfolio.",
        inputSchema: z.object({}),
      },
      async () => {
        const rows = await db.select().from(tags);
        return {
          content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
        };
      }
    );

    server.registerTool(
      "create_tag",
      {
        title: "Create tag",
        description: "Create a new blog tag.",
        inputSchema: z.object({
          nameFr: z.string().min(1).max(60),
          nameEn: z.string().min(1).max(60),
          slug: z.string().min(1).max(60).optional(),
        }),
      },
      async ({ nameFr, nameEn, slug }) => {
        const id = newId();
        const finalSlug = slug ? slugify(slug) : slugify(nameEn);
        await db.insert(tags).values({ id, slug: finalSlug, nameFr, nameEn });
        return { content: [{ type: "text", text: `Created tag "${nameEn}" (${finalSlug}).` }] };
      }
    );

    server.registerTool(
      "list_blog_posts",
      {
        title: "List blog posts",
        description: "List blog posts, optionally filtered by locale and/or status.",
        inputSchema: z.object({
          locale: localeSchema.optional(),
          status: statusSchema.optional(),
        }),
      },
      async ({ locale, status }) => {
        const conditions = [
          locale ? eq(posts.locale, locale) : undefined,
          status ? eq(posts.status, status) : undefined,
        ].filter((condition): condition is NonNullable<typeof condition> => Boolean(condition));

        const rows = await db
          .select({
            slug: posts.slug,
            locale: posts.locale,
            title: posts.title,
            status: posts.status,
            publishedAt: posts.publishedAt,
            updatedAt: posts.updatedAt,
          })
          .from(posts)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(posts.updatedAt));

        return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
      }
    );

    server.registerTool(
      "create_blog_post",
      {
        title: "Create blog post",
        description:
          "Publish (or draft) a new blog post on the portfolio. Writes Markdown content. " +
          "Tag names that don't exist yet are created automatically.",
        inputSchema: z.object({
          slug: z
            .string()
            .max(100)
            .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only.")
            .optional()
            .describe("URL slug. Derived from the title when omitted."),
          locale: localeSchema,
          title: z.string().min(1).max(200),
          summary: z.string().min(1).max(500).describe("Short excerpt used in listings and meta description."),
          contentMd: z.string().min(1).describe("Full post body, as Markdown."),
          status: statusSchema.default("draft"),
          coverImage: z.string().max(500).optional(),
          metaTitle: z.string().max(200).optional(),
          metaDescription: z.string().max(300).optional(),
          tags: z.array(z.string()).optional().describe("Tag names, e.g. [\"AI\", \"Next.js\"]."),
          publishedAt: z.string().optional().describe("ISO date (YYYY-MM-DD). Defaults to today."),
        }),
      },
      async (input) => {
        const slug = input.slug ? slugify(input.slug) : slugify(input.title);
        const [existing] = await db
          .select({ id: posts.id })
          .from(posts)
          .where(and(eq(posts.slug, slug), eq(posts.locale, input.locale)))
          .limit(1);
        if (existing) {
          return {
            isError: true,
            content: [
              { type: "text", text: `A post with slug "${slug}" already exists in locale "${input.locale}".` },
            ],
          };
        }

        const id = newId();
        await db.insert(posts).values({
          id,
          slug,
          locale: input.locale,
          title: input.title,
          summary: input.summary,
          contentMd: input.contentMd,
          coverImage: input.coverImage ?? null,
          status: input.status,
          metaTitle: input.metaTitle ?? null,
          metaDescription: input.metaDescription ?? null,
          publishedAt: new Date(input.publishedAt ?? Date.now()),
        });

        if (input.tags && input.tags.length > 0) {
          await syncPostTags(id, await resolveTagIds(input.tags));
        }

        return {
          content: [
            {
              type: "text",
              text: `Created ${input.status} post "${input.title}" at /${input.locale === "fr" ? "" : "en/"}blog/${slug}.`,
            },
          ],
        };
      }
    );

    server.registerTool(
      "update_blog_post",
      {
        title: "Update blog post",
        description: "Update an existing blog post, identified by its slug and locale.",
        inputSchema: z.object({
          slug: z.string().min(1).max(100),
          locale: localeSchema,
          title: z.string().min(1).max(200).optional(),
          summary: z.string().min(1).max(500).optional(),
          contentMd: z.string().min(1).optional(),
          status: statusSchema.optional(),
          coverImage: z.string().max(500).optional(),
          metaTitle: z.string().max(200).optional(),
          metaDescription: z.string().max(300).optional(),
          tags: z.array(z.string()).optional(),
        }),
      },
      async ({ slug, locale, tags: tagNames, ...fields }) => {
        const [existing] = await db
          .select({ id: posts.id })
          .from(posts)
          .where(and(eq(posts.slug, slug), eq(posts.locale, locale)))
          .limit(1);
        if (!existing) {
          return {
            isError: true,
            content: [{ type: "text", text: `No post found with slug "${slug}" in locale "${locale}".` }],
          };
        }

        const updates = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
        if (Object.keys(updates).length > 0) {
          await db.update(posts).set({ ...updates, updatedAt: new Date() }).where(eq(posts.id, existing.id));
        }
        if (tagNames) {
          await syncPostTags(existing.id, await resolveTagIds(tagNames));
        }

        return { content: [{ type: "text", text: `Updated post "${slug}" (${locale}).` }] };
      }
    );
  },
  { serverInfo: { name: "portfolio-blog", version: "1.0.0" } }
);

const authedHandler = withMcpAuth(
  handler,
  (_request, bearerToken) => {
    const expected = process.env.MCP_API_KEY;
    if (!expected || bearerToken !== expected) return undefined;
    return { token: bearerToken, clientId: "portfolio-owner", scopes: [] };
  },
  { required: true }
);

export { authedHandler as GET, authedHandler as POST };
