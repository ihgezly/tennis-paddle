"use client";

import { useCallback } from "react";

import { useFilters } from "@/lib/core/hooks/use-filters";

import FilterSection from "./filter-section";
import PriceSlider from "./price-slider";

const MIN_PRICE = 0;
const MAX_PRICE = 50000;
const STEP = 50;

export default function PriceFilter() {
  const { minPrice, maxPrice, setSingle, clearKey } = useFilters();

  const currentMin = Number(minPrice ?? MIN_PRICE);
  const currentMax = Number(maxPrice ?? MAX_PRICE);

  const hasPriceFilter = Boolean(minPrice || maxPrice);

  const handleChange = useCallback(
    (min: number, max: number) => {
      if (min <= MIN_PRICE) {
        clearKey("minPrice");
      } else {
        setSingle("minPrice", String(min));
      }

      if (max >= MAX_PRICE) {
        clearKey("maxPrice");
      } else {
        setSingle("maxPrice", String(max));
      }
    },
    [setSingle, clearKey],
  );

  return (
    <FilterSection
      title="السعر"
      activeCount={hasPriceFilter ? 1 : 0}
      defaultOpen={false}
    >
      <PriceSlider
        min={MIN_PRICE}
        max={MAX_PRICE}
        step={STEP}
        valueMin={currentMin}
        valueMax={currentMax}
        onChange={handleChange}
      />
    </FilterSection>
  );
}