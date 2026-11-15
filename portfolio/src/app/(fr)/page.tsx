import { HomePage, homeMetadata } from "@/views/home-page";

export function generateMetadata() {
  return homeMetadata("fr");
}

export default function Page() {
  return <HomePage locale="fr" />;
}
