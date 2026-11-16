"use client";

import { Search, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";

/** URL-synced search box shared by every admin list page: debounces into
 *  `?q=`, resets `page` to 1 so a new search always starts from page one.
 *  `useSearchParams` requires a Suspense boundary, so this wraps the real
 *  implementation rather than making every call site remember to. */
export function ListSearch(props: { placeholder?: string }) {
  return (
    <Suspense fallback={<ListSearchFallback placeholder={props.placeholder} />}>
      <ListSearchInner {...props} />
    </Suspense>
  );
}

function ListSearchFallback({ placeholder = "Search…" }: { placeholder?: string }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input disabled placeholder={placeholder} aria-label={placeholder} className="pl-8" />
    </div>
  );
}

function ListSearchInner({ placeholder = "Search…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [value, setValue] = useState(urlQuery);
  // Mirrors the URL so an external change (back/forward navigation) can be
  // told apart from the user's own typing — adjusted during render rather
  // than in an effect, per https://react.dev/learn/you-might-not-need-an-effect.
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setValue(urlQuery);
  }

  const [, startTransition] = useTransition();

  useEffect(() => {
    if (value === urlQuery) return;

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set("q", value);
      else params.delete("q");
      params.delete("page");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-8 pr-8"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
