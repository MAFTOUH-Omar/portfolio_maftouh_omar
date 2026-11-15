import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span
            aria-hidden
            className="flex size-12 items-center justify-center rounded-lg bg-hero-ink font-mono text-base font-semibold text-hero-panel dark:ring-1 dark:ring-white/10"
          >
            OM
          </span>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight">Administration</h1>
            <p className="text-sm text-muted-foreground">Portfolio backoffice</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
