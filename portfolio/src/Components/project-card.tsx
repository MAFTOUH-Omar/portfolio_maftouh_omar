"use client";

import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import StackIcon from "tech-stack-icons";
import { useTheme } from "next-themes";

interface TechTag {
  readonly name: string;
  readonly icon?: string;
}

interface Props {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly TechTag[];
  link?: string;
  images?: readonly string[];
  video?: string;
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  className?: string;
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  link,
  images,
  video,
  links,
  className,
}: Props) {
  const [currentImage, setCurrentImage] = useState(0);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const allImages = images ?? [];

  const nextImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentImage((prev) => (prev + 1) % allImages.length);
    },
    [allImages.length]
  );

  const prevImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentImage(
        (prev) => (prev - 1 + allImages.length) % allImages.length
      );
    },
    [allImages.length]
  );

  return (
    <Card
      className={cn(
        "group flex flex-col overflow-hidden border border-border/60 dark:border-white/10 rounded-xl shadow-sm hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-300 ease-out h-full bg-card",
        className
      )}
    >
      {/* Image / Video area — edge to edge */}
      <div className="relative h-48 overflow-hidden bg-muted/50 flex-shrink-0">
        {/* Bottom gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent z-[1] pointer-events-none" />

        {video && (
          <video
            src={video}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-top"
          />
        )}

        {allImages.length > 0 ? (
          <>
            {allImages.map((img, index) => (
              <div
                key={index}
                className="absolute inset-0 transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(${(index - currentImage) * 100}%)`,
                }}
              >
                <Image
                  src={img}
                  alt={`${title} - ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 400px"
                  className="object-cover object-top group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                />
              </div>
            ))}

            {allImages.length > 1 && (
              <>
                {/* Prev / Next */}
                <button
                  onClick={prevImage}
                  className="absolute left-2.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-md p-1.5 text-white opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-black/65 hover:scale-110"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 backdrop-blur-md p-1.5 text-white opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-black/65 hover:scale-110"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-3.5" />
                </button>

                {/* Pill dots */}
                <div className="absolute bottom-2.5 left-1/2 z-10 -translate-x-1/2 flex items-center gap-1">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImage(index);
                      }}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        currentImage === index
                          ? "w-5 bg-white"
                          : "w-1.5 bg-white/50 hover:bg-white/75"
                      )}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Counter badge */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="text-white/90 text-[10px] font-medium bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full tabular-nums">
                    {currentImage + 1}&thinsp;/&thinsp;{allImages.length}
                  </span>
                </div>
              </>
            )}
          </>
        ) : !video ? (
          /* Placeholder when no media */
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-black text-muted-foreground/15 select-none">
              {title.charAt(0)}
            </span>
          </div>
        ) : null}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm leading-snug text-foreground truncate">
              {title}
            </h3>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5 font-medium">
              {dates}
            </p>
          </div>

          {links && links.length > 0 && (
            <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
              {links.map((l, idx) => (
                <Link
                  href={l.href}
                  key={idx}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground/60 hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                  title={l.type}
                >
                  {l.type === "Source" ? (
                    <svg
                      viewBox="0 0 438.549 438.549"
                      className="size-[15px]"
                      fill="currentColor"
                    >
                      <path d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z" />
                    </svg>
                  ) : (
                    <ExternalLink className="size-[15px]" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <Markdown className="prose max-w-full text-pretty font-sans text-[11.5px] leading-relaxed text-muted-foreground dark:prose-invert line-clamp-3">
          {description}
        </Markdown>

        {/* Tech tags */}
        {tags && tags.length > 0 && (
          <div className="mt-auto pt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <div
                key={tag.name}
                className="inline-flex items-center gap-1 bg-secondary/70 dark:bg-white/5 border border-border/50 dark:border-white/10 py-[3px] px-[7px] rounded-md"
              >
                {tag.icon && mounted ? (
                  <span className="size-[12px] flex-shrink-0">
                    <StackIcon
                      name={tag.icon}
                      variant={resolvedTheme === "dark" ? "dark" : "light"}
                    />
                  </span>
                ) : (
                  <span className="size-[12px] flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                    {tag.name.charAt(0)}
                  </span>
                )}
                <span className="text-[11px] font-medium text-muted-foreground">
                  {tag.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
