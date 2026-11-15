import { HomePage, homeMetadata } from "@/views/home-page";

export function generateMetadata() {
  return homeMetadata("en");
}

export default function Page() {
  return <HomePage locale="en" />;
}
