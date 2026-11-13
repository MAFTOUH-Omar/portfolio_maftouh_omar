import { BlogPost, blogPostMetadata, blogPostStaticParams } from "@/views/blog";

type Props = { params: Promise<{ slug: string }> };

// Every post is prerendered; unknown slugs are a 404.
export const dynamicParams = false;

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
