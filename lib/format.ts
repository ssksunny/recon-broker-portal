/** Formatting helpers shared across pages/components. All are null-safe — the API returns a lot of Optional fields. */

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === "string" ? parseFloat(value) : value;
  return Number.isNaN(num) ? null : num;
}

export function formatCurrency(value: number | string | null | undefined): string {
  const num = toNumber(value);
  if (num === null) return "—";
  return num.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** Signed currency, for variance columns — makes over/under-billing legible at a glance. */
export function formatSignedCurrency(value: number | string | null | undefined): string {
  const num = toNumber(value);
  if (num === null) return "—";
  const formatted = Math.abs(num).toLocaleString("en-US", { style: "currency", currency: "USD" });
  if (num > 0) return `+${formatted}`;
  if (num < 0) return `-${formatted}`;
  return formatted;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function formatPercent(value: number | string | null | undefined): string {
  const num = toNumber(value);
  if (num === null) return "—";
  return `${Math.round(num * 100)}%`;
}

export function titleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
