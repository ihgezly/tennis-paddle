"use client";

import { useFilters } from "@/lib/core/hooks/use-filters";

import CheckboxList from "./checkbox-list";
import FilterSection from "./filter-section";

type ProductType = {
  id: number;
  title: string;
  slug: string;
};

export default function ProductTypeFilter({
  productTypes,
}: {
  productTypes: ProductType[];
}) {
  const { types: selected, toggleMulti } = useFilters();

  if (!productTypes.length) return null;

  const options = productTypes.map((pt) => ({
    value: pt.slug,
    label: pt.title,
  }));

  return (
    <FilterSection title="النوع" activeCount={selected.length}>
      <CheckboxList
        options={options}
        selected={selected}
        onToggle={(value) => toggleMulti("type", value)}
      />
    </FilterSection>
  );
}