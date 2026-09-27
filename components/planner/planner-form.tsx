"use client"

import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { NEIGHBORHOODS } from "@/data/neighborhoods"
import { useRouter } from "@/i18n/navigation"
import { formatHHMM, planQuery } from "@/lib/planner/params"
import {
  INTERESTS,
  MOODS,
  PACES,
  type Interest,
  type Mood,
  type PlanInput,
} from "@/lib/planner/types"
import { cn } from "@/lib/utils"
import { BOROUGHS, DIETARY_OPTIONS } from "@/types/enums"
import type { DietaryOption } from "@/types/place"

const MOOD_EMOJI: Record<Mood, string> = {
  first_timer: "🗽",
  foodie: "🍜",
  romantic: "🕯️",
  chill: "🌿",
  adventurous: "🧭",
  artsy: "🎨",
}

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

const label = "text-sm font-bold"
const field =
  "h-11 w-full rounded-xl border-2 border-foreground/15 bg-card px-3 text-base focus-visible:border-foreground"
const chip = (on: boolean) =>
  cn(
    "inline-flex h-9 cursor-pointer items-center rounded-full border-2 px-3.5 text-sm font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
    on
      ? "border-foreground bg-foreground text-background"
      : "border-foreground/15 bg-card hover:border-foreground",
  )

export function PlannerForm({ initial, today }: { initial: PlanInput; today: string }) {
  const t = useTranslations()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [input, setInput] = useState(initial)
  const set = <K extends keyof PlanInput>(key: K, value: PlanInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }))

  const setTime = (key: "start" | "end", hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number)
    if (Number.isNaN(h)) return
    set(key, h * 60 + m)
  }

  return (
    <form
      className="space-y-7"
      onSubmit={(e) => {
        e.preventDefault()
        const end = input.end <= input.start ? input.end + 1440 : input.end
        startTransition(() =>
          router.push(
            { pathname: "/my-day", query: planQuery({ ...input, end }) },
            { scroll: false },
          ),
        )
      }}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-1">
          <label htmlFor="plan-date" className={label}>
            {t("planner.date")}
          </label>
          <input
            id="plan-date"
            type="date"
            required
            min={today}
            value={input.date}
            onChange={(e) => set("date", e.target.value)}
            className={field}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="plan-start" className={label}>
            {t("planner.start")}
          </label>
          <input
            id="plan-start"
            type="time"
            step={900}
            required
            value={formatHHMM(input.start)}
            onChange={(e) => setTime("start", e.target.value)}
            className={field}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="plan-end" className={label}>
            {t("planner.end")}
          </label>
          <input
            id="plan-end"
            type="time"
            step={900}
            required
            aria-describedby="plan-end-hint"
            value={formatHHMM(input.end)}
            onChange={(e) => setTime("end", e.target.value)}
            className={field}
          />
        </div>
        <p id="plan-end-hint" className="-mt-2 text-xs text-muted-foreground sm:col-span-3">
          {t("planner.endHint")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="plan-from" className={label}>
            {t("planner.from")}
          </label>
          <select
            id="plan-from"
            value={input.from}
            onChange={(e) => set("from", e.target.value)}
            className={field}
          >
            {BOROUGHS.map((b) => (
              <optgroup key={b} label={t(`borough.${b}`)}>
                {NEIGHBORHOODS.filter((n) => n.borough === b).map((n) => (
                  <option key={n.slug} value={n.slug}>
                    {n.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <label htmlFor="plan-budget" className={label}>
              {t("planner.budget")}
            </label>
            <output htmlFor="plan-budget" className="font-display text-2xl tabular-nums">
              {t("planner.budgetValue", { amount: input.budget })}
            </output>
          </div>
          <input
            id="plan-budget"
            type="range"
            min={0}
            max={400}
            step={10}
            value={input.budget}
            onChange={(e) => set("budget", Number(e.target.value))}
            className="h-11 w-full accent-foreground"
          />
        </div>
      </div>

      <fieldset className="space-y-2.5">
        <legend className={cn(label, "mb-2.5")}>{t("planner.mood")}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MOODS.map((mood) => {
            const on = input.mood === mood
            return (
              <label
                key={mood}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
                  on
                    ? "border-foreground bg-taxi/30"
                    : "border-foreground/15 bg-card hover:border-foreground",
                )}
              >
                <input
                  type="radio"
                  name="mood"
                  value={mood}
                  checked={on}
                  onChange={() => set("mood", mood)}
                  className="sr-only"
                />
                <span aria-hidden className="text-2xl">
                  {MOOD_EMOJI[mood]}
                </span>
                {t(`planner.moods.${mood}`)}
              </label>
            )
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={cn(label, "mb-2.5")}>{t("planner.interests")}</legend>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => (
            <label key={interest} className={chip(input.interests.includes(interest))}>
              <input
                type="checkbox"
                className="sr-only"
                checked={input.interests.includes(interest)}
                onChange={() => set("interests", toggle<Interest>(input.interests, interest))}
              />
              {t(`planner.interest.${interest}`)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={cn(label, "mb-2.5")}>{t("planner.dietary")}</legend>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((d) => (
            <label key={d} className={chip(input.dietary.includes(d))}>
              <input
                type="checkbox"
                className="sr-only"
                checked={input.dietary.includes(d)}
                onChange={() => set("dietary", toggle<DietaryOption>(input.dietary, d))}
              />
              {t(`dietary.${d}`)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <fieldset>
          <legend className={cn(label, "mb-2.5")}>{t("planner.pace")}</legend>
          <div className="grid grid-cols-2 gap-2">
            {PACES.map((pace) => (
              <label
                key={pace}
                className={cn(
                  "cursor-pointer rounded-xl border-2 p-3 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
                  input.pace === pace
                    ? "border-foreground bg-taxi/30"
                    : "border-foreground/15 bg-card hover:border-foreground",
                )}
              >
                <input
                  type="radio"
                  name="pace"
                  className="sr-only"
                  checked={input.pace === pace}
                  onChange={() => set("pace", pace)}
                />
                <span className="block font-bold">{t(`planner.paces.${pace}`)}</span>
                <span
                  className={cn(
                    "block text-xs",
                    input.pace === pace ? "text-foreground/85" : "text-muted-foreground",
                  )}
                >
                  {t(`planner.paceHints.${pace}`)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-center gap-3 self-end rounded-xl border-2 border-foreground/15 bg-card p-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring">
          <input
            type="checkbox"
            role="switch"
            checked={input.weatherAware}
            onChange={(e) => set("weatherAware", e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="relative h-6 w-11 shrink-0 rounded-full bg-muted transition-colors peer-checked:bg-line-green after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
          />
          <span>
            <span className="block font-bold">{t("planner.weather")}</span>
            <span className="block text-xs text-muted-foreground">{t("planner.weatherHint")}</span>
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-14 w-full rounded-full bg-taxi text-lg font-bold text-taxi-foreground shadow-[4px_4px_0_0_var(--foreground)] transition-transform active:translate-y-0.5 disabled:opacity-70 sm:w-auto sm:px-10"
      >
        {t("planner.submit")}
      </button>
    </form>
  )
}
