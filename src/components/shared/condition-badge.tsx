type ConditionType = {
  code: string;
  nameAr?: string | null;
  nameEn?: string | null;
} | null | undefined;

type ConditionGrade = {
  code: string;
  nameAr?: string | null;
  nameEn?: string | null;
} | null | undefined;

type Props = {
  conditionType?: ConditionType;
  conditionGrade?: ConditionGrade;
  size?: "sm" | "md";
  className?: string;
};

export default function ConditionBadge({
  conditionType,
  conditionGrade,
  size = "md",
  className = "",
}: Props) {
  if (!conditionType) return null;

  const isLikeNew = conditionGrade?.code === "like_new";
  const isNew = conditionType.code === "new";

  const text = isLikeNew ? "كسر زيرو" : isNew ? "جديد" : "مستعمل";

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium backdrop-blur-sm mono-num ${sizeClass} ${className}`}
      style={
        isLikeNew
          ? {
              backgroundColor: "var(--volt)",
              color: "var(--volt-text)",
              boxShadow: "0 0 12px var(--volt-glow)",
            }
          : {
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }
      }
    >
      {text}
    </span>
  );
}