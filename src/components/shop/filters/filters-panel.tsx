"use client";

import { FiX } from "react-icons/fi";
import BrandFilter from "./brand-filter";
import ConditionFilter from "./condition-filter";
import PriceFilter from "./price-filter";

export default function FiltersPanel({
  isOpen,
  onClose,
  brands,
}: {
  isOpen: boolean;
  onClose: () => void;
  brands: string[];
}) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 max-w-full bg-surface p-6 overflow-y-auto transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-2"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-8">
          <BrandFilter brands={brands} />
          <ConditionFilter />
          <PriceFilter />
        </div>
      </div>
    </>
  );
}