"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CONDITIONS = ["new", "used"];

export default function ConditionFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const current = searchParams.get("condition");

  const toggle = (condition: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (current === condition) params.delete("condition");
    else params.set("condition", condition);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">
        Condition
      </h4>
      <div className="flex flex-wrap gap-2">
        {CONDITIONS.map((condition) => (
          <button
            key={condition}
            onClick={() => toggle(condition)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              current === condition
                ? "bg-gold text-black"
                : "bg-surface-2 text-foreground/80 hover:bg-surface-2/60"
            }`}
          >
            {condition === "new" ? "New" : "Used"}
          </button>
        ))}
      </div>
    </div>
  );
}