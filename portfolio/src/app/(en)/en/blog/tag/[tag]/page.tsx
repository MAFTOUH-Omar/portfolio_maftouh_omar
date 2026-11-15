import { TagPage, tagPageMetadata, tagPageStaticParams } from "@/views/blog";

type Props = { params: Promise<{ tag: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return tagPageStaticParams("en");
}

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  return tagPageMetadata("en", tag);
}

export default async function Page({ params }: Props) {
  const { tag } = await params;
  return <TagPage locale="en" tag={tag} />;
}
