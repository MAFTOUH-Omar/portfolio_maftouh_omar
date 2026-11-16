import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function hrefFor(basePath: string, query: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Prev/next + page-number links shared by every admin list page. Pure
 *  links (no client JS) so it works even before hydration. */
export function ListPagination({
  basePath,
  page,
  totalPages,
  query = {},
}: {
  basePath: string;
  page: number;
  totalPages: number;
  query?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-2 border-t px-4 py-3 sm:px-5"
    >
      <Link
        href={hrefFor(basePath, query, page - 1)}
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : undefined}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          page <= 1 && "pointer-events-none opacity-40"
        )}
      >
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">Previous</span>
      </Link>
      <div className="flex items-center gap-1">
        {pages.map((p, i) => (
          <span key={p} className="flex items-center">
            {i > 0 && pages[i - 1] !== p - 1 && (
              <span className="px-1.5 text-sm text-muted-foreground">…</span>
            )}
            <Link
              href={hrefFor(basePath, query, p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: p === page ? "default" : "ghost", size: "sm" }),
                "min-w-8 px-0 tabular-nums"
              )}
            >
              {p}
            </Link>
          </span>
        ))}
      </div>
      <Link
        href={hrefFor(basePath, query, page + 1)}
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : undefined}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          page >= totalPages && "pointer-events-none opacity-40"
        )}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
