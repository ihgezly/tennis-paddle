"use client";

import ActiveFilters from "./active-filters";
import BrandFilter from "./brand-filter";
import ConditionFilter from "./condition-filter";
import PriceFilter from "./price-filter";
import ProductTypeFilter from "./product-type-filter";
import SportTypeFilter from "./sport-type-filter";

type ProductType = {
  id: number;
  title: string;
  slug: string;
};

type Props = {
  brands: string[];
  productTypes?: ProductType[];
  /** لو الصفحة أصلاً رياضة معينة، نخفي فلتر الرياضة */
  hideSportFilter?: boolean;
  /** لو الصفحة أصلاً نوع معين، نخفي فلتر النوع */
  hideTypeFilter?: boolean;
  /** الفلتر الحالي للرياضة (لو موجود في الـURL) */
  baseSport?: string;
};

export default function FiltersSidebar({
  brands,
  productTypes,
  hideSportFilter = false,
  hideTypeFilter = false,
  baseSport,
}: Props) {
  return (
    <div className="filters-sidebar">
      <BrandFilter brands={brands} />

      {!hideTypeFilter && productTypes && productTypes.length > 0 ? (
        <ProductTypeFilter productTypes={productTypes} />
      ) : null}

      {!hideSportFilter ? (
        <SportTypeFilter baseSport={baseSport} />
      ) : null}

      <ConditionFilter />

      <PriceFilter />
    </div>
  );
}

// نصدّر ActiveFilters عشان يستخدم في الـtoolbar
export { ActiveFilters };