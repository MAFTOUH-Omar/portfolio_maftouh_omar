import { TechIcon } from "@/components/tech-icon";

interface SkillBadgeProps {
  name: string;
  icon: string;
}

export function SkillBadge({ name, icon }: SkillBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-default hover:border-accent hover:bg-accent/10">
      <span className="size-5 flex-shrink-0 flex items-center justify-center overflow-hidden">
        <TechIcon name={icon} />
      </span>
      <span>{name}</span>
    </div>
  );
}
