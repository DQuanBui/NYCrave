"use client"

import { Minus, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useState } from "react"
import { pillClass } from "@/components/listing/filter-menu"
import { Input } from "@/components/ui/input"
import { NYC_SALES_TAX, splitBill } from "@/lib/bill"
import { formatUsd } from "@/lib/format"

const TIP_RATES = [0.18, 0.2, 0.22] as const

/** What a sit-down meal really costs: menu prices plus sales tax plus tip. */
export function TipCalculator() {
  const t = useTranslations("tips.calculator")
  const ids = { bill: useId(), people: useId() }
  const [bill, setBill] = useState("60")
  const [rate, setRate] = useState<number>(0.2)
  const [people, setPeople] = useState(2)

  const amount = Number.parseFloat(bill.replace(/[$,\s]/g, ""))
  const result = Number.isFinite(amount) && amount > 0 ? splitBill(amount, rate, people) : null

  return (
    <div className="space-y-5 rounded-2xl border bg-card p-5">
      <h3 className="font-bold">{t("title")}</h3>
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor={ids.bill} className="text-sm font-semibold">
            {t("bill")}
          </label>
          <div className="relative">
            <span
              aria-hidden
              className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
            >
              $
            </span>
            <Input
              id={ids.bill}
              inputMode="decimal"
              value={bill}
              onChange={(e) => setBill(e.target.value)}
              className="h-11 pl-7 text-base tabular-nums"
            />
          </div>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">{t("tip")}</legend>
          <div className="flex flex-wrap gap-1.5">
            {TIP_RATES.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={rate === r}
                onClick={() => setRate(r)}
                className={pillClass(rate === r)}
              >
                {Math.round(r * 100)}%
              </button>
            ))}
          </div>
        </fieldset>
        <div className="space-y-2">
          <span id={ids.people} className="text-sm font-semibold">
            {t("people")}
          </span>
          <div role="group" aria-labelledby={ids.people} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPeople((p) => Math.max(1, p - 1))}
              disabled={people <= 1}
              aria-label={t("fewer")}
              className="grid size-10 place-items-center rounded-full border disabled:opacity-40"
            >
              <Minus aria-hidden className="size-4" />
            </button>
            <output aria-live="polite" className="w-8 text-center text-lg font-bold tabular-nums">
              {people}
            </output>
            <button
              type="button"
              onClick={() => setPeople((p) => Math.min(20, p + 1))}
              aria-label={t("more")}
              className="grid size-10 place-items-center rounded-full border"
            >
              <Plus aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {result ? (
        <dl aria-live="polite" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Figure label={t("tax", { rate: (NYC_SALES_TAX * 100).toFixed(3) })} value={result.tax} />
          <Figure label={t("tipAmount")} value={result.tip} />
          <Figure label={t("total")} value={result.total} />
          <Figure label={t("each")} value={result.each} highlight />
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">{t("invalid")}</p>
      )}
      <p className="text-xs text-muted-foreground">{t("note")}</p>
    </div>
  )
}

function Figure({
  label,
  value,
  highlight,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div
      className={
        highlight ? "rounded-xl bg-taxi p-3 text-taxi-foreground" : "rounded-xl bg-muted p-3"
      }
    >
      <dt className="text-sm">{label}</dt>
      <dd className="text-xl font-bold tabular-nums">{formatUsd(value)}</dd>
    </div>
  )
}
