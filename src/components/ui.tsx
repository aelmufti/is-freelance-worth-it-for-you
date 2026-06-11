import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  lift = false,
}: {
  children: ReactNode;
  className?: string;
  lift?: boolean;
}) {
  return (
    <div
      className={`border-[3px] border-ink bg-card shadow-brutal ${lift ? "brutal-lift" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  color = "var(--color-tag-yellow)",
  textColor = "#0d0d0d",
}: {
  children: ReactNode;
  color?: string;
  textColor?: string;
}) {
  return (
    <span
      className="inline-block border-2 border-ink px-2 py-0.5 text-xs font-extrabold uppercase tracking-[0.06em]"
      style={{ background: color, color: textColor }}
    >
      {children}
    </span>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
      {children}
    </h2>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-extrabold uppercase tracking-[0.06em]">
      {children}
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full border-2 border-ink bg-white px-3 py-2 font-bold"
        />
        {suffix && (
          <span className="flex items-center border-2 border-l-0 border-ink bg-muted px-3 text-xs font-extrabold uppercase">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
}) {
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <FieldLabel>{label}</FieldLabel>
        <span className="flex max-w-full shrink-0">
          <input
            type="number"
            value={Number.isFinite(value) ? value : 0}
            step={step}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v)) onChange(v);
            }}
            className="w-16 min-w-0 border-2 border-ink bg-white px-1 py-0.5 text-right text-xs font-extrabold"
          />
          <span className="flex items-center border-2 border-l-0 border-ink bg-primary px-1 text-[10px] font-extrabold uppercase text-white">
            {unit}
          </span>
        </span>
      </div>
      <input
        type="range"
        value={Math.min(max, Math.max(min, value))}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full border-2 border-ink bg-white px-3 py-2 font-bold"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="brutal-press flex w-full items-center gap-3 border-2 border-ink bg-white px-3 py-2 text-left shadow-brutal-sm"
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-ink text-sm font-extrabold text-white"
        style={{ background: checked ? "var(--color-accent)" : "#fff" }}
      >
        {checked ? "✓" : ""}
      </span>
      <span>
        <span className="block text-xs font-extrabold uppercase tracking-[0.06em]">
          {label}
        </span>
        {hint && <span className="block text-xs opacity-70">{hint}</span>}
      </span>
    </button>
  );
}

export const euro = (v: number) =>
  Math.round(v).toLocaleString("fr-FR") + " €";

export const euroSigne = (v: number) =>
  (v > 0 ? "+" : v < 0 ? "−" : "") +
  Math.abs(Math.round(v)).toLocaleString("fr-FR") +
  " €";
