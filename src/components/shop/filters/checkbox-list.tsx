"use client";

import { FiCheck } from "react-icons/fi";

import { cn } from "@/lib/core/util";

type Option = {
  value: string;
  label: string;
  count?: number;
};

type Props = {
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
  emptyText?: string;
};

export default function CheckboxList({
  options,
  selected,
  onToggle,
  emptyText = "لا توجد خيارات",
}: Props) {
  if (options.length === 0) {
    return (
      <p className="px-2 py-3 text-xs text-text-muted">{emptyText}</p>
    );
  }

  return (
    <div className="checkbox-list">
      {options.map((option) => {
        const checked = selected.includes(option.value);

        return (
          <label
            key={option.value}
            className="checkbox-item"
            onClick={(e) => {
              e.preventDefault();
              onToggle(option.value);
            }}
          >
            <span
              className={cn(
                "checkbox-item__box",
                checked && "checkbox-item__box--checked",
              )}
            >
              {checked ? (
                <FiCheck className="checkbox-item__check" />
              ) : null}
            </span>

            <span
              className={cn(
                "checkbox-item__label",
                checked && "checkbox-item--checked",
              )}
            >
              {option.label}
            </span>

            {typeof option.count === "number" ? (
              <span className="checkbox-item__count">{option.count}</span>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}