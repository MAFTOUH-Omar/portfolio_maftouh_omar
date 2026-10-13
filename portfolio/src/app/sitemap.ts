import { getBlogPosts } from "@/data/blog";
import { DATA } from "@/data/resume";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${DATA.url}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const staticRoutes: MetadataRoute.Sitemap = ["", "/blog"].map((route) => ({
    url: `${DATA.url}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...staticRoutes, ...blogRoutes];
}
