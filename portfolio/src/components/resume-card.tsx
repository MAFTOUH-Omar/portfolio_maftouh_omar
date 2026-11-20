"use client";

import { Badge } from "./ui/badge";
import { Card, CardHeader } from "./ui/card";
import { CardDecor } from "./card-decor";
import { accentFor, type Accent } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ResumeCardProps {
  logoUrl: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  badges?: readonly string[];
  period: string;
  description?: string;
  /** Card color + shape; the home page passes accentsFor() so neighbours differ. */
  accent?: Accent;
}
export const ResumeCard = ({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
  description,
  accent,
}: ResumeCardProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  // Each company / school keeps its own hue and shape (hashed from its name).
  const look = accent ?? accentFor(title);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (description) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Link
      href={href || "#"}
      className="block cursor-pointer"
      onClick={handleClick}
    >
      <Card className="group/card relative isolate flex overflow-hidden p-3 transition-colors hover:border-primary/60 sm:p-4">
        {/* Decorations sit behind the content (absolute, -z-10), so the text
            and layout are exactly as before. */}
        <CardDecor accent={look} size="sm" />
        <div className="flex-none">
          <div
            className={cn(
              "relative m-auto size-12 overflow-hidden rounded-full border border-border bg-white ring-2 ring-offset-2 ring-offset-card",
              look.tone.ring
            )}
          >
            <Image
              src={logoUrl}
              alt={altText}
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
        </div>
        <div className="flex-grow ml-4 items-center flex-col group">
          <CardHeader>
            <div className="flex items-center justify-between gap-x-2 text-base">
              <h3 className="inline-flex items-center justify-center font-semibold leading-none text-xs sm:text-sm">
                {title}
                {badges && (
                  <span className="inline-flex gap-x-1">
                    {badges.map((badge, index) => (
                      <Badge
                        variant="outline"
                        className="align-middle text-xs border-forest/40 bg-forest/10 text-forest"
                        key={index}
                      >
                        {badge}
                      </Badge>
                    ))}
                  </span>
                )}
                <ChevronRightIcon
                  className={cn(
                    "size-4 translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-forest",
                    isExpanded ? "rotate-90" : "rotate-0"
                  )}
                />
              </h3>
              <div className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-right font-mono text-[11px] tabular-nums text-muted-foreground sm:text-xs">
                {period}
              </div>
            </div>
            {subtitle && <div className="font-sans text-xs text-muted-foreground">{subtitle}</div>}
          </CardHeader>
          {description && (
            // grid-rows 0fr → 1fr animates to the content's natural height in pure CSS.
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="mt-2 text-justify text-xs hyphens-auto sm:text-sm">{description}</div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
