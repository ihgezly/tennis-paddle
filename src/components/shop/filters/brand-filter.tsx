"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function BrandFilter({ brands }: { brands: string[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const current = searchParams.get("brand");

  const toggle = (brand: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (current === brand) params.delete("brand");
    else params.set("brand", brand);
    router.push(`?${params.toString()}`);
  };

  if (!brands.length) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">
        Brand
      </h4>
      <div className="flex flex-wrap gap-2">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => toggle(brand)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              current === brand
                ? "bg-gold text-black"
                : "bg-surface-2 text-foreground/80 hover:bg-surface-2/60"
            }`}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
}