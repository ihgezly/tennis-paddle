"use client";

import { useFilters } from "@/lib/core/hooks/use-filters";

import CheckboxList from "./checkbox-list";
import FilterSection from "./filter-section";

const CONDITIONS = [
  { value: "new", label: "جديد" },
  { value: "used", label: "مستعمل" },
];

export default function ConditionFilter() {
  const { conditions: selected, toggleMulti } = useFilters();

  return (
    <FilterSection title="الحالة" activeCount={selected.length}>
      <CheckboxList
        options={CONDITIONS}
        selected={selected}
        onToggle={(value) => toggleMulti("condition", value)}
      />
    </FilterSection>
  );
}