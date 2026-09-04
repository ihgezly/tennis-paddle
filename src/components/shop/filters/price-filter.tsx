"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PriceFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [min, setMin] = useState(searchParams.get("minPrice") || "");
  const [max, setMax] = useState(searchParams.get("maxPrice") || "");

  const applyPrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set("minPrice", min);
    else params.delete("minPrice");
    if (max) params.set("maxPrice", max);
    else params.delete("maxPrice");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">
        Price Range
      </h4>
      <div className="flex gap-3">
        <input
          type="number"
          placeholder="Min"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          onBlur={applyPrice}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-gold"
        />
        <input
          type="number"
          placeholder="Max"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          onBlur={applyPrice}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-gold"
        />
      </div>
    </div>
  );
}