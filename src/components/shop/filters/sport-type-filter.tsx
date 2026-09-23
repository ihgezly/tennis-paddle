"use client";

import { useFilters } from "@/lib/core/hooks/use-filters";

import CheckboxList from "./checkbox-list";
import FilterSection from "./filter-section";

const SPORTS = [
  { value: "padel", label: "بادل" },
  { value: "tennis", label: "تنس" },
  { value: "general", label: "عام" },
];

export default function SportTypeFilter({
  baseSport,
}: {
  baseSport?: string;
}) {
  const { sports: selected, toggleMulti } = useFilters();

  // لو الـbaseSport موجود، نخفي الرياضة دي من الخيارات
  const options = baseSport
    ? SPORTS.filter((s) => s.value !== baseSport)
    : SPORTS;

  return (
    <FilterSection title="الرياضة" activeCount={selected.length}>
      <CheckboxList
        options={options}
        selected={selected}
        onToggle={(value) => toggleMulti("sport", value)}
      />
    </FilterSection>
  );
}