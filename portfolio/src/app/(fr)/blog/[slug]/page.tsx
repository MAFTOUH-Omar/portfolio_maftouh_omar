import { BlogPost, blogPostMetadata, blogPostStaticParams } from "@/views/blog";

type Props = { params: Promise<{ slug: string }> };

// Known posts are prerendered at build time; a slug published later (from the
// admin UI or the MCP server) is rendered on demand on first visit and then
// cached — without this, new posts would 404 until the next full deploy.
export const dynamicParams = true;

export function generateStaticParams() {
  return blogPostStaticParams("fr");
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return blogPostMetadata("fr", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <BlogPost locale="fr" slug={slug} />;
}
