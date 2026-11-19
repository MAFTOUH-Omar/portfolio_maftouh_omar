import { BlogIndex, blogIndexMetadata } from "@/views/blog";

export function generateMetadata() {
  return blogIndexMetadata("en");
}

export default function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <BlogIndex locale="en" searchParams={searchParams} />;
}
