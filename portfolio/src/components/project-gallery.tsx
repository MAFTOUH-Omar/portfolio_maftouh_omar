"use client";

import type { ProjectLabels } from "@/components/project-shared";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Props {
  images: readonly string[];
  title: string;
  /** Controlled slide index. */
  index: number;
  onIndexChange: (index: number) => void;
  labels: Pick<ProjectLabels, "previousImage" | "nextImage" | "goToImage" | "screenshot">;
  sizes: string;
  /** "hover": controls fade in when the parent `group` is hovered (cards). */
  controls?: "hover" | "always";
}

/** Sliding screenshot carousel. Fills its (relative, overflow-hidden) parent. */
export function ProjectGallery({
  images,
  title,
  index,
  onIndexChange,
  labels,
  sizes,
  controls = "hover",
}: Props) {
  const count = images.length;
  const onHover = controls === "hover";

  const go = (e: React.MouseEvent, next: number) => {
    e.preventDefault();
    e.stopPropagation();
    onIndexChange((next + count) % count);
  };

  const arrow = cn(
    "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-black/65",
    onHover ? "p-1.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100" : "p-2"
  );

  return (
    <>
      {images.map((img, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className="absolute inset-0 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(${(i - index) * 100}%)` }}
        >
          {/* Blurred fill so screenshots of any ratio show whole, without empty bars */}
          <Image
            src={img}
            alt=""
            aria-hidden
            fill
            sizes={sizes}
            className="scale-110 object-cover opacity-80 blur-2xl"
          />
          <Image
            src={img}
            alt={`${labels.screenshot} ${title} (${i + 1}/${count})`}
            fill
            sizes={sizes}
            className="object-contain"
          />
        </div>
      ))}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => go(e, index - 1)}
            className={cn(arrow, "left-2.5")}
            aria-label={labels.previousImage}
          >
            <ChevronLeft className={onHover ? "size-3.5" : "size-4"} />
          </button>
          <button
            type="button"
            onClick={(e) => go(e, index + 1)}
            className={cn(arrow, "right-2.5")}
            aria-label={labels.nextImage}
          >
            <ChevronRight className={onHover ? "size-3.5" : "size-4"} />
          </button>

          <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
            {images.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={(e) => go(e, i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === i ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
                )}
                aria-label={`${labels.goToImage} ${i + 1}`}
                aria-current={index === i}
              />
            ))}
          </div>

          <div className="absolute right-2.5 top-2.5 z-10">
            <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium tabular-nums text-white/90 backdrop-blur-md">
              {index + 1}&thinsp;/&thinsp;{count}
            </span>
          </div>
        </>
      )}
    </>
  );
}
