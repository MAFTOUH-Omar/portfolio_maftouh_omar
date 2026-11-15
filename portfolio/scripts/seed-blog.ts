import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

try {
  process.loadEnvFile(".env.local");
} catch {
  // already loaded into the shell env, e.g. in CI.
}

// One-time import of the previously-filesystem MDX posts (content/<locale>/*.mdx)
// into the DB. Dynamic imports: see scripts/seed.ts for why.
async function main() {
  const { db } = await import("../src/db/client");
  const { posts } = await import("../src/db/schema");
  const { newId } = await import("../src/lib/id");
  const { locales } = await import("../src/lib/i18n");

  const contentDir = path.join(process.cwd(), "content");

  for (const locale of locales) {
    const dir = path.join(contentDir, locale);
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".mdx")) continue;
      const slug = file.slice(0, -".mdx".length);
      const source = fs.readFileSync(path.join(dir, file), "utf-8");
      const { content, data } = matter(source);

      await db.insert(posts).values({
        id: newId(),
        slug,
        locale,
        title: data.title,
        summary: data.summary,
        contentMd: content.trim(),
        coverImage: data.image ?? null,
        status: "published",
        publishedAt: new Date(data.publishedAt),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(data.publishedAt),
      });
      console.log(`Imported ${locale}/${slug}`);
    }
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
