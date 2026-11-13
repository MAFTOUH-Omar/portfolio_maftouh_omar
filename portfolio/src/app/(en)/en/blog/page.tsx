import { BlogIndex, blogIndexMetadata } from "@/views/blog";

export function generateMetadata() {
  return blogIndexMetadata("en");
}

export default function Page() {
  return <BlogIndex locale="en" />;
}
