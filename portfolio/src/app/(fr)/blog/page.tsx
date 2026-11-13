import { BlogIndex, blogIndexMetadata } from "@/views/blog";

export function generateMetadata() {
  return blogIndexMetadata("fr");
}

export default function Page() {
  return <BlogIndex locale="fr" />;
}
