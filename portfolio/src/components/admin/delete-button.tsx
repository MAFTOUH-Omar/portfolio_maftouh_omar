"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  confirmMessage = "Delete this item? This cannot be undone.",
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setPending(true);
    try {
      await action();
      toast.success("Deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={pending}>
      Delete
    </Button>
  );
}
