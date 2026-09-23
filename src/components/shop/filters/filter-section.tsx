"use client";

import { type ReactNode, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

import { cn } from "@/lib/core/util";

type Props = {
  title: string;
  defaultOpen?: boolean;
  activeCount?: number;
  children: ReactNode;
};

export default function FilterSection({
  title,
  defaultOpen = true,
  activeCount = 0,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="filter-section">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="filter-section__toggle"
        aria-expanded={open}
      >
        <span className="filter-section__title">
          {title}
          {activeCount > 0 ? (
            <span className="filter-section__badge">{activeCount}</span>
          ) : null}
        </span>
        <FiChevronDown
          size={16}
          className={cn(
            "filter-section__chevron",
            open && "filter-section__chevron--open",
          )}
        />
      </button>

      <div
        className={cn(
          "filter-section__content",
          open && "filter-section__content--open",
        )}
      >
        <div className="filter-section__inner">{children}</div>
      </div>
    </div>
  );
}