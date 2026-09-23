"use client";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
  icon?: React.ReactNode;
};

export default function StatsCard({
  label,
  value,
  hint,
  accent = "var(--admin-volt)",
  icon,
}: Props) {
  return (
    <div
      className="admin-stat-card"
      style={{ "--stat-accent": accent } as React.CSSProperties}
    >
      {icon ? (
        <div className="admin-stat-card__icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}

      <div className="admin-stat-card__label">{label}</div>
      <div className="admin-stat-card__value">{value}</div>
      {hint ? <div className="admin-stat-card__hint">{hint}</div> : null}
    </div>
  );
}