"use client";

import { useState } from "react";
import { FiSliders } from "react-icons/fi";

import { useFilters } from "@/lib/core/hooks/use-filters";

import ActiveFilters from "./active-filters";
import FiltersPanel from "./filters-panel";
import SortDropdown from "./sort-dropdown";

type ProductType = {
  id: number;
  title: string;
  slug: string;
};

type Props = {
  brands: string[];
  productTypes?: ProductType[];
  totalCount: number;
  displayedCount: number;
  hideSportFilter?: boolean;
  hideTypeFilter?: boolean;
  baseSport?: string;
};

export default function FiltersToolbar({
  brands,
  productTypes,
  totalCount,
  displayedCount,
  hideSportFilter,
  hideTypeFilter,
  baseSport,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { activeCount } = useFilters();

  return (
    <>
      <div className="filters-toolbar">
        <div className="filters-toolbar__left">
          <button
            type="button"
            className="filters-trigger"
            onClick={() => setDrawerOpen(true)}
          >
            <FiSliders size={14} />
            الفلاتر
            {activeCount > 0 ? (
              <span className="filters-trigger__badge">{activeCount}</span>
            ) : null}
          </button>

          <span className="filters-toolbar__result-count">
            عرض <strong>{displayedCount}</strong> من {totalCount}
          </span>
        </div>

        <div className="filters-toolbar__right">
          <SortDropdown />
        </div>
      </div>

      <ActiveFilters />

      <FiltersPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        brands={brands}
        productTypes={productTypes}
        hideSportFilter={hideSportFilter}
        hideTypeFilter={hideTypeFilter}
        baseSport={baseSport}
      />
    </>
  );
}