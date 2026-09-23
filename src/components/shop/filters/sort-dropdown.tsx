"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiChevronDown, FiSliders } from "react-icons/fi";

import { cn } from "@/lib/core/util";
import {
  SORT_LABELS,
  type SortOption,
  useFilters,
} from "@/lib/core/hooks/use-filters";

export default function SortDropdown() {
  const { sort, setSingle } = useFilters();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickAway = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const currentLabel = SORT_LABELS[sort] ?? "الأحدث";

  return (
    <div className="sort-dropdown" ref={ref}>
      <button
        type="button"
        className="sort-dropdown__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <FiSliders size={14} />
        <span>ترتيب: {currentLabel}</span>
        <FiChevronDown
          size={14}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open ? (
        <div className="sort-dropdown__menu" role="listbox">
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <button
              key={key}
              type="button"
              role="option"
              aria-selected={sort === key}
              className={cn(
                "sort-dropdown__option",
                sort === key && "sort-dropdown__option--active",
              )}
              onClick={() => {
                setSingle("sort", key);
                setOpen(false);
              }}
            >
              <span>{SORT_LABELS[key]}</span>
              {sort === key ? <FiCheck size={14} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}