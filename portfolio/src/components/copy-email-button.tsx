"use client";

import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  email: string;
  label: string;
  copiedLabel: string;
  className?: string;
}

/** Copies the address to the clipboard and confirms for 2 seconds. */
export function CopyEmailButton({ email, label, copiedLabel, className }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      // Clipboard blocked (insecure context / permissions): fall back to mailto.
      window.location.href = `mailto:${email}`;
    }
  };

  const Icon = copied ? Check : Copy;

  return (
    <button type="button" onClick={copy} className={className}>
      <Icon className={cn("size-4", copied && "text-emerald-400")} />
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
