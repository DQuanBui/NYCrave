/** "$30", "$25.50": whole dollars drop the cents. */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** "$30" for a single price, "$28–$37" for a range. */
export function formatPriceRange({ min, max }: { min: number; max: number }): string {
  return min === max ? formatUsd(min) : `${formatUsd(min)}–${formatUsd(max)}`
}
