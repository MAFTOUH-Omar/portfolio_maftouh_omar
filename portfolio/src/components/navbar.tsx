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
import { DATA } from "@/data/resume";
import { localizePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { HomeIcon, NotebookIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  locale: Locale;
  translatedSlugs: readonly string[];
}

export default function Navbar({ locale, translatedSlugs }: Props) {
  const t = getDictionary(locale);
  const items = [
    { href: localizePath(locale, "/"), icon: HomeIcon, label: t.nav.home },
    { href: localizePath(locale, "/blog"), icon: NotebookIcon, label: t.nav.blog },
  ];

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-4 flex origin-bottom h-full max-h-14">
      <Dock className="z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-1 bg-background transform-gpu ">
        {items.map((item) => (
          <DockIcon key={item.href}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-12"
                  )}
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
        <Separator orientation="vertical" className="h-full" />
        {Object.entries(DATA.contact.social)
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
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12"
                      )}
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
        <Separator orientation="vertical" className="h-full py-2" />
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <LanguageSwitcher
                locale={locale}
                label={t.nav.switchLanguage}
                translatedSlugs={translatedSlugs}
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
              <ModeToggle label={t.nav.theme} />
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
