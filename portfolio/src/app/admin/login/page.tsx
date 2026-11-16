import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { ModeToggle } from "@/components/mode-toggle";

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 p-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-hero-panel/25 [clip-path:polygon(100%_0,100%_38%,72%_0)] dark:bg-hero-panel/10" />
        <svg viewBox="0 0 340 235" className="absolute bottom-0 left-0 h-auto w-[180px] opacity-70 sm:w-[260px]">
          <circle cx="80" cy="264" r="262" className="fill-hero-disc/60" />
          <circle cx="30" cy="534" r="360" className="fill-hero-ink/40" />
        </svg>
      </div>

      <div className="absolute right-4 top-4">
        <ModeToggle label="Toggle theme" />
      </div>

      <div className="relative w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span
            aria-hidden
            className="relative isolate flex size-14 items-center justify-center overflow-hidden rounded-lg bg-hero-ink font-mono text-lg font-semibold text-hero-panel ring-1 ring-black/5 dark:ring-white/10"
          >
            <span className="absolute inset-0 bg-hero-panel [clip-path:polygon(55%_0,100%_0,100%_55%)] opacity-90" aria-hidden />
            <span className="relative">OM</span>
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
