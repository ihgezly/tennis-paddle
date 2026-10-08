"use client";

import { FiSliders } from "react-icons/fi";

import { useFilters } from "@/lib/core/hooks/use-filters";

import ActiveFilters from "./active-filters";
import BrandFilter from "./brand-filter";
import ConditionFilter from "./condition-filter";
import PriceFilter from "./price-filter";
import ProductTypeFilter from "./product-type-filter";
import SportTypeFilter from "./sport-type-filter";

type ProductType = { id: number; title: string; slug: string };

type Props = {
  brands: string[];
  productTypes?: ProductType[];
  hideSportFilter?: boolean;
  hideTypeFilter?: boolean;
  baseSport?: string;
};

export default function FiltersSidebar({
  brands,
  productTypes,
  hideSportFilter = false,
  hideTypeFilter = false,
  baseSport,
}: Props) {
  const { activeCount, clearAll } = useFilters();

  return (
    <div className="filters-sidebar">
      <div className="filters-sidebar__head">
        <span className="filters-sidebar__title">
          <FiSliders size={15} />
          تصفية النتائج
          {activeCount > 0 ? <span className="filter-section__badge">{activeCount}</span> : null}
        </span>
        {activeCount > 0 ? (
          <button type="button" className="filters-sidebar__clear" onClick={clearAll}>
            مسح الكل
          </button>
        ) : null}
      </div>

      <BrandFilter brands={brands} />

      {!hideTypeFilter && productTypes && productTypes.length > 0 ? (
        <ProductTypeFilter productTypes={productTypes} />
      ) : null}

      {!hideSportFilter ? <SportTypeFilter baseSport={baseSport} /> : null}

      <ConditionFilter />
      <PriceFilter />
    </div>
  );
}

export { ActiveFilters };