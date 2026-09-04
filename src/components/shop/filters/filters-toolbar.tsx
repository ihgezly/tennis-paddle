"use client";

import { useState } from "react";
import { FiSliders } from "react-icons/fi";
import FiltersPanel from "./filters-panel";

export default function FiltersToolbar({ brands }: { brands: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-gold lg:hidden"
      >
        <FiSliders size={16} />
        Filters
      </button>

      <FiltersPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        brands={brands}
      />
    </>
  );
}