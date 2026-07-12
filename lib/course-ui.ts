/** Bỏ dấu tiếng Việt để so khớp cấp độ ổn định. */
function normalizeLevel(level?: string | null): string {
  return (level ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ");
}

export type CourseLevelKey = "basic" | "intermediate" | "advanced" | "default";

export function getCourseLevelKey(level?: string | null): CourseLevelKey {
  const l = normalizeLevel(level);
  if (
    l.includes("co ban") ||
    l.includes("coban") ||
    l.includes("basic") ||
    l.includes("beginner") ||
    l.includes("nhap mon")
  ) {
    return "basic";
  }
  if (l.includes("trung cap") || l.includes("trungcap") || l.includes("intermediate")) {
    return "intermediate";
  }
  if (
    l.includes("nang cao") ||
    l.includes("nangcao") ||
    l.includes("advanced") ||
    l.includes("chuyen sau")
  ) {
    return "advanced";
  }
  return "default";
}

/** Class đầy đủ — giữ literal để Tailwind không purge. */
export const COURSE_LEVEL_BADGE_CLASS: Record<CourseLevelKey, string> = {
  basic: "border-transparent bg-emerald-500 text-white",
  intermediate: "border-transparent bg-amber-500 text-white",
  advanced: "border-transparent bg-rose-500 text-white",
  default: "border-transparent bg-sky-500 text-white",
};

export function getCourseLevelBadgeClass(level?: string | null): string {
  return COURSE_LEVEL_BADGE_CLASS[getCourseLevelKey(level)];
}
