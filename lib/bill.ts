/** Combined New York State and New York City sales tax on restaurant meals. */
export const NYC_SALES_TAX = 0.08875

/**
 * Tax and tip for a pre-tax bill, split evenly. The tip is on the pre-tax amount,
 * as is customary; the per-person share rounds up to the cent so nobody is short.
 * Works in whole cents so $5.325 of tax rounds to $5.33, like a register.
 */
export function splitBill(subtotal: number, tipRate: number, people: number) {
  const sub = Math.round(subtotal * 100)
  const tax = Math.round((sub * 8875) / 100_000)
  const tip = Math.round(sub * tipRate)
  const total = sub + tax + tip
  const each = Math.ceil(total / Math.max(1, people))
  return { tax: tax / 100, tip: tip / 100, total: total / 100, each: each / 100 }
}
