"use client";
import StackIcon from "tech-stack-icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface SkillBadgeProps {
  name: string;
  icon: string;
}

export function SkillBadge({ name, icon }: SkillBadgeProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors cursor-default">
      <span className="size-5 flex-shrink-0">
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
