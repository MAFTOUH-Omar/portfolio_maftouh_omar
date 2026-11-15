"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Shared "New X" / "Edit X" dialog: a trigger button, a form, and a save
 *  button wired to a Server Action. Used by every admin CRUD section. */
export function EntityDialog({
  trigger,
  triggerVariant = "default",
  title,
  description,
  action,
  children,
  contentClassName,
}: {
  trigger: React.ReactNode;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
  title: string;
  description?: string;
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      await action(formData);
      toast.success("Saved.");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm">
          {trigger}
        </Button>
      </DialogTrigger>
      <DialogContent className={contentClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {children}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
