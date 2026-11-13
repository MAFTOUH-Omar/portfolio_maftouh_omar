import { HomePage, homeMetadata } from "@/views/home-page";

export const metadata = homeMetadata("fr");

export default function Page() {
  return <HomePage locale="fr" />;
}
