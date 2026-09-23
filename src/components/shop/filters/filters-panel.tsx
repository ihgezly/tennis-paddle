"use client";

import { useEffect } from "react";
import { FiX } from "react-icons/fi";

import { useFilters } from "@/lib/core/hooks/use-filters";

import FiltersSidebar from "./filters-sidebar";

type ProductType = {
  id: number;
  title: string;
  slug: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  brands: string[];
  productTypes?: ProductType[];
  hideSportFilter?: boolean;
  hideTypeFilter?: boolean;
  baseSport?: string;
};

export default function FiltersPanel({
  isOpen,
  onClose,
  brands,
  productTypes,
  hideSportFilter,
  hideTypeFilter,
  baseSport,
}: Props) {
  const { activeCount, clearAll } = useFilters();

  // قفل السكرول
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="filters-drawer-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="filters-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="الفلاتر"
      >
        <div className="filters-drawer__header">
          <div className="filters-drawer__title">
            <span>الفلاتر</span>
            {activeCount > 0 ? (
              <span className="filter-section__badge">{activeCount}</span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="filters-drawer__close"
            aria-label="إغلاق"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="filters-drawer__body">
          <FiltersSidebar
            brands={brands}
            productTypes={productTypes}
            hideSportFilter={hideSportFilter}
            hideTypeFilter={hideTypeFilter}
            baseSport={baseSport}
          />
        </div>

        <div className="filters-drawer__footer">
          <button
            type="button"
            onClick={() => {
              clearAll();
              onClose();
            }}
            className="filters-drawer__btn-clear"
          >
            مسح الكل
          </button>
          <button
            type="button"
            onClick={onClose}
            className="filters-drawer__btn-apply"
          >
            عرض النتائج
          </button>
        </div>
      </div>
    </>
  );
}