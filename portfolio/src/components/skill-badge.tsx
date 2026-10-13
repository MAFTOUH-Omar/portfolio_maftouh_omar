"use client";
import { StackIcon } from "@/components/tech-icon";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";

interface SkillBadgeProps {
  name: string;
  icon: string;
}

export function SkillBadge({ name, icon }: SkillBadgeProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors cursor-default">
      <span className="size-5 flex-shrink-0 flex items-center justify-center overflow-hidden [&_svg]:size-full [&_img]:size-full">
        {mounted && (
          <StackIcon
            name={icon}
            variant={resolvedTheme === "dark" ? "dark" : "light"}
          />
        )}
      </span>
      <span>{name}</span>
    </div>
  );
}
