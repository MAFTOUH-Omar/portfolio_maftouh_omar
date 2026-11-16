"use client";

import { useMemo, useState } from "react";
import { Popover } from "radix-ui";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import icons from "@/data/tech-icons.json";
import { TechIcon } from "@/components/tech-icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ICON_NAMES = Object.keys(icons).sort();
const PAGE_SIZE = 24;

/** Searchable, paginated icon combobox — replaces a 50-option native
 *  <select> that forced scrolling through an alphabetical list blind. Keeps
 *  a hidden input so the value still rides along with the surrounding
 *  native form action. */
export function IconPicker({
  name,
  defaultValue,
  required,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? ICON_NAMES.filter((n) => n.toLowerCase().includes(needle)) : ICON_NAMES;
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setQuery("");
      setPage(0);
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <input type="hidden" name={name} value={value} required={required} />
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <span className="flex min-w-0 items-center gap-2">
            {value ? (
              <>
                <TechIcon name={value} className="size-4 shrink-0" />
                <span className="truncate">{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Choose an icon…</span>
            )}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 w-72 rounded-md border bg-popover p-2 text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Search icons…"
              className="h-8 pl-8"
            />
          </div>
          {pageItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No icon found.</p>
          ) : (
            <div className="grid grid-cols-6 gap-1">
              {pageItems.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  title={iconName}
                  onClick={() => {
                    setValue(iconName);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-md p-1.5 transition-colors hover:bg-accent",
                    value === iconName && "bg-accent ring-1 ring-ring"
                  )}
                >
                  <TechIcon name={iconName} className="size-5" />
                </button>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
              <button
                type="button"
                disabled={safePage <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="flex items-center gap-1 rounded-sm px-1.5 py-1 hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="size-3.5" />
                Prev
              </button>
              <span>
                Page {safePage + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="flex items-center gap-1 rounded-sm px-1.5 py-1 hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
              >
                Next
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
