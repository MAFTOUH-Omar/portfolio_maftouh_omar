import { BlogIndex, blogIndexMetadata } from "@/views/blog";

export function generateMetadata() {
  return blogIndexMetadata("fr");
}

export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <BlogIndex locale="fr" searchParams={searchParams} />;
}
