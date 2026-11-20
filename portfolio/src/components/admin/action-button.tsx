"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Small button that runs a Server Action with a toast — approve, hide… */
export function ActionButton({
  action,
  label,
  successMessage = "Done.",
  variant = "outline",
}: {
  action: () => Promise<void>;
  label: string;
  successMessage?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await action();
      toast.success(successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant={variant} size="sm" onClick={handleClick} disabled={pending}>
      {label}
    </Button>
  );
}
