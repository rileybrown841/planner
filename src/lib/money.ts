/**
 * Money formatting. This is a personal, single-currency tool — amounts are
 * plain numbers and shown with a `$`. Swap the formatter here if that changes.
 */
const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatMoney(n: number): string {
  return fmt.format(n);
}

/** No cents — for big rollup numbers where precision is noise. */
export function formatMoneyShort(n: number): string {
  return Number.isInteger(n) ? fmtWhole.format(n) : fmt.format(n);
}
