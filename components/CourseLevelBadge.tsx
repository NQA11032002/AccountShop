import { cn } from "@/lib/utils";
import { getCourseLevelKey } from "@/lib/course-ui";

type CourseLevelBadgeProps = {
  level: string;
  className?: string;
};

/** Nhãn cấp độ — class màu khai báo trực tiếp để Tailwind giữ lại. */
export default function CourseLevelBadge({ level, className }: CourseLevelBadgeProps) {
  const key = getCourseLevelKey(level);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm",
        key === "basic" && "border-transparent bg-emerald-500 text-white",
        key === "intermediate" && "border-transparent bg-amber-500 text-white",
        key === "advanced" && "border-transparent bg-rose-500 text-white",
        key === "default" && "border-transparent bg-sky-500 text-white",
        className
      )}
    >
      {level}
    </span>
  );
}
