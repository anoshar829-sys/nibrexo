// Presentation formatters for admin dashboard values.
// A fixed locale keeps server-rendered output deterministic (and testable).

const LOCALE = "en-US";

export function formatMoney(cents: number, currency: string): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatCompactMoney(cents: number, currency: string): string {
  if (cents === 0) {
    return formatMoney(0, currency);
  }
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(cents / 100);
  } catch {
    return formatMoney(cents, currency);
  }
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(value);
}

export function formatSignedPercent(percent: number): string {
  const magnitude = (Math.round(Math.abs(percent) * 10) / 10).toFixed(1);
  const sign = percent > 0 ? "+" : percent < 0 ? "-" : "";
  return `${sign}${magnitude}%`;
}

export function trendDirection(percent: number | null): "up" | "down" | "flat" {
  if (percent === null || percent === 0) {
    return "flat";
  }
  return percent > 0 ? "up" : "down";
}

export function formatShortDate(iso: string): string {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return iso.slice(0, 10);
  }
  return new Intl.DateTimeFormat(LOCALE, { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso.slice(0, 10);
  }
  return new Intl.DateTimeFormat(LOCALE, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    date,
  );
}
