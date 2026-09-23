"use client";

import { useMemo } from "react";

import { useFilters } from "@/lib/core/hooks/use-filters";

import CheckboxList from "./checkbox-list";
import FilterSection from "./filter-section";

export default function BrandFilter({ brands }: { brands: string[] }) {
  const { brands: selected, toggleMulti } = useFilters();

  const options = useMemo(
    () => brands.map((b) => ({ value: b, label: b })),
    [brands],
  );

  if (!brands.length) return null;

  return (
    <FilterSection title="الماركة" activeCount={selected.length}>
      <CheckboxList
        options={options}
        selected={selected}
        onToggle={(value) => toggleMulti("brand", value)}
        emptyText="لا توجد ماركات"
      />
    </FilterSection>
  );
}