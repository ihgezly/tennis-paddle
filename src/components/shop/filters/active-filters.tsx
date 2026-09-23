"use client";

import { FiX } from "react-icons/fi";

import { useFilters } from "@/lib/core/hooks/use-filters";

const KEY_LABELS: Record<string, string> = {
  brand: "الماركة",
  condition: "الحالة",
  sport: "الرياضة",
  type: "النوع",
  minPrice: "أدنى سعر",
  maxPrice: "أقصى سعر",
  q: "البحث",
};

const VALUE_LABELS: Record<string, string> = {
  new: "جديد",
  used: "مستعمل",
  padel: "بادل",
  tennis: "تنس",
  general: "عام",
};

export default function ActiveFilters() {
  const {
    brands,
    conditions,
    sports,
    types,
    minPrice,
    maxPrice,
    search,
    toggleMulti,
    clearKey,
    clearAll,
    hasActiveFilters,
  } = useFilters();

  if (!hasActiveFilters) return null;

  const chips: Array<{
    key: string;
    label: string;
    value: string;
    onRemove: () => void;
  }> = [];

  for (const brand of brands) {
    chips.push({
      key: `brand-${brand}`,
      label: KEY_LABELS.brand,
      value: brand,
      onRemove: () => toggleMulti("brand", brand),
    });
  }

  for (const condition of conditions) {
    chips.push({
      key: `condition-${condition}`,
      label: KEY_LABELS.condition,
      value: VALUE_LABELS[condition] ?? condition,
      onRemove: () => toggleMulti("condition", condition),
    });
  }

  for (const sport of sports) {
    chips.push({
      key: `sport-${sport}`,
      label: KEY_LABELS.sport,
      value: VALUE_LABELS[sport] ?? sport,
      onRemove: () => toggleMulti("sport", sport),
    });
  }

  for (const type of types) {
    chips.push({
      key: `type-${type}`,
      label: KEY_LABELS.type,
      value: type,
      onRemove: () => toggleMulti("type", type),
    });
  }

  if (minPrice) {
    chips.push({
      key: "minPrice",
      label: KEY_LABELS.minPrice,
      value: minPrice,
      onRemove: () => clearKey("minPrice"),
    });
  }

  if (maxPrice) {
    chips.push({
      key: "maxPrice",
      label: KEY_LABELS.maxPrice,
      value: maxPrice,
      onRemove: () => clearKey("maxPrice"),
    });
  }

  if (search) {
    chips.push({
      key: "q",
      label: KEY_LABELS.q,
      value: search,
      onRemove: () => clearKey("q"),
    });
  }

  return (
    <div className="active-filters">
      {chips.map((chip) => (
        <div key={chip.key} className="filter-chip">
          <span className="filter-chip__label">{chip.label}:</span>
          <span className="filter-chip__value">{chip.value}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="filter-chip__remove"
            aria-label={`إزالة ${chip.label}`}
          >
            <FiX size={10} strokeWidth={3} />
          </button>
        </div>
      ))}

      <button type="button" onClick={clearAll} className="clear-all-btn">
        <FiX size={12} />
        مسح الكل
      </button>
    </div>
  );
}