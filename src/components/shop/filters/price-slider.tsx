"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
};

export default function PriceSlider({
  min,
  max,
  step = 50,
  valueMin,
  valueMax,
  onChange,
}: Props) {
  const [localMin, setLocalMin] = useState(valueMin);
  const [localMax, setLocalMax] = useState(valueMax);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // sync from props
  useEffect(() => {
    setLocalMin(valueMin);
    setLocalMax(valueMax);
  }, [valueMin, valueMax]);

  const scheduleChange = useCallback(
    (nextMin: number, nextMax: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(nextMin, nextMax);
      }, 400);
    },
    [onChange],
  );

  const range = max - min;
  const leftPercent = ((localMin - min) / range) * 100;
  const rightPercent = ((localMax - min) / range) * 100;
  const activeWidth = rightPercent - leftPercent;

  return (
    <div className="price-slider">
      <div className="price-slider__values">
        <input
          type="number"
          value={localMin}
          min={min}
          max={localMax}
          step={step}
          onChange={(e) => {
            const next = Math.min(Number(e.target.value) || min, localMax);
            setLocalMin(next);
            scheduleChange(next, localMax);
          }}
          className="price-slider__input"
          aria-label="الحد الأدنى"
        />
        <span className="price-slider__separator">—</span>
        <input
          type="number"
          value={localMax}
          min={localMin}
          max={max}
          step={step}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value) || max, localMin);
            setLocalMax(next);
            scheduleChange(localMin, next);
          }}
          className="price-slider__input"
          aria-label="الحد الأقصى"
        />
      </div>

      <div className="price-slider__range">
        <div className="price-slider__track">
          <div
            className="price-slider__range-active"
            style={{
              insetInlineStart: `${leftPercent}%`,
              width: `${activeWidth}%`,
            }}
          />
        </div>

        <div
          className="price-slider__thumb"
          style={{ insetInlineStart: `${leftPercent}%` }}
          aria-hidden="true"
        />
        <div
          className="price-slider__thumb"
          style={{ insetInlineStart: `${rightPercent}%` }}
          aria-hidden="true"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), localMax);
            setLocalMin(next);
            scheduleChange(next, localMax);
          }}
          className="price-slider__input-raw"
          aria-label="السعر الأدنى"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), localMin);
            setLocalMax(next);
            scheduleChange(localMin, next);
          }}
          className="price-slider__input-raw"
          aria-label="السعر الأقصى"
        />
      </div>
    </div>
  );
}