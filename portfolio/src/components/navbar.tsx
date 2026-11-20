import { Dock, DockIcon } from "./magicui/dock";
import { ModeToggle } from "./mode-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { buttonVariants } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { getDictionary } from "@/data/dictionaries";
import { getSiteData } from "@/data/resume";
import { localizePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { HomeIcon, NotebookIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  locale: Locale;
  translatedSlugs: readonly string[];
  targetTagSlugs: readonly string[];
}

/** Dock items on the dark brand-ink bar: light icons, soft white hover. */
const dockItem = "size-12 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-hero-panel";

export default async function Navbar({ locale, translatedSlugs, targetTagSlugs }: Props) {
  const t = getDictionary(locale);
  const data = await getSiteData();
  const items = [
    { href: localizePath(locale, "/"), icon: HomeIcon, label: t.nav.home },
    { href: localizePath(locale, "/blog"), icon: NotebookIcon, label: t.nav.blog },
  ];

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-4 flex origin-bottom h-full max-h-14">
      <Dock className="z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-1 transform-gpu border-white/10 bg-hero-ink text-white shadow-lg shadow-hero-ink/25 dark:ring-1 dark:ring-white/5">
        {items.map((item) => (
          <DockIcon key={item.href}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className={cn(buttonVariants({ variant: "ghost", size: "icon" }), dockItem)}
                >
                  <item.icon className="size-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        ))}
        <Separator orientation="vertical" className="h-full bg-white/15" />
        {Object.entries(data.contact.social)
          .filter(([, social]) => social.navbar)
          .map(([key, social]) => {
            const label = key === "email" ? t.nav.email : social.name;
            return (
              <DockIcon key={key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), dockItem)}
                    >
                      <social.icon className="size-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{label}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            );
          })}
        <Separator orientation="vertical" className="h-full bg-white/15 py-2" />
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <LanguageSwitcher
                locale={locale}
                label={t.nav.switchLanguage}
                translatedSlugs={translatedSlugs}
                targetTagSlugs={targetTagSlugs}
                className={dockItem}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t.nav.switchLanguage}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <ModeToggle label={t.nav.theme} className={dockItem} />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t.nav.theme}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>
    </nav>
  );
}
