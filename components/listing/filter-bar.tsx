"use client"

import { List, Map as MapIcon, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { FilterMenu, pillClass } from "@/components/listing/filter-menu"
import type { FilterOptions } from "@/lib/listing"
import { hasActiveFilters } from "@/lib/listing"
import type { ListingParams } from "@/lib/place-filters"
import { cn } from "@/lib/utils"
import type { Borough, DietaryOption, LightTime, VibeTag } from "@/types/place"

type FilterBarProps = {
  params: ListingParams
  options: FilterOptions
  onChange: (patch: Partial<ListingParams>) => void
  onClear: () => void
}

export function FilterBar({ params, options, onChange, onClear }: FilterBarProps) {
  const t = useTranslations()
  const hoods = options.neighborhoods.filter((n) => !params.borough || n.borough === params.borough)

  return (
    <div role="group" aria-label={t("filters.label")} className="flex flex-wrap items-center gap-2">
      <div className="-mx-4 scrollbar-none flex flex-1 items-center gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <button
          type="button"
          aria-pressed={Boolean(params.open)}
          onClick={() => onChange({ open: params.open ? undefined : true })}
          className={pillClass(Boolean(params.open))}
        >
          <span
            aria-hidden
            className={cn(
              "size-2 rounded-full",
              params.open ? "bg-line-green" : "bg-line-green/60",
            )}
          />
          {t("filters.open")}
        </button>

        {options.showFree ? (
          <button
            type="button"
            aria-pressed={Boolean(params.free)}
            onClick={() => onChange({ free: params.free ? undefined : true })}
            className={pillClass(Boolean(params.free))}
          >
            {t("filters.free")}
          </button>
        ) : null}

        {options.boroughs.length > 1 ? (
          <FilterMenu
            label={t("filters.borough")}
            anyLabel={t("filters.anyBorough")}
            value={params.borough}
            options={options.boroughs.map((b) => ({ value: b, label: t(`borough.${b}`) }))}
            onSelect={(v) => onChange({ borough: v as Borough | undefined, hood: undefined })}
          />
        ) : null}

        {hoods.length > 1 ? (
          <FilterMenu
            label={t("filters.neighborhood")}
            anyLabel={t("filters.anyNeighborhood")}
            value={params.hood}
            options={hoods.map((n) => ({ value: n.name, label: n.name }))}
            onSelect={(v) => onChange({ hood: v })}
          />
        ) : null}

        {options.prices.length > 1 ? (
          <FilterMenu
            label={t("filters.price")}
            anyLabel={t("filters.anyPrice")}
            value={params.price ? String(params.price) : undefined}
            options={options.prices.map((l) => ({
              value: String(l),
              label: t("filters.upTo", { price: "$".repeat(l) }),
            }))}
            onSelect={(v) => onChange({ price: v ? (Number(v) as 1 | 2 | 3 | 4) : undefined })}
          />
        ) : null}

        {options.vibes.length > 0 ? (
          <FilterMenu
            label={t("filters.vibe")}
            anyLabel={t("filters.anyVibe")}
            value={params.vibe}
            options={options.vibes.map((v) => ({ value: v, label: t(`vibe.${v}`) }))}
            onSelect={(v) => onChange({ vibe: v as VibeTag | undefined })}
          />
        ) : null}

        {options.dietary.length > 0 ? (
          <FilterMenu
            label={t("filters.dietary")}
            anyLabel={t("filters.anyDietary")}
            value={params.diet}
            options={options.dietary.map((d) => ({ value: d, label: t(`dietary.${d}`) }))}
            onSelect={(v) => onChange({ diet: v as DietaryOption | undefined })}
          />
        ) : null}

        {options.lights.length > 0 ? (
          <FilterMenu
            label={t("filters.light")}
            anyLabel={t("filters.anyLight")}
            value={params.light}
            options={options.lights.map((l) => ({ value: l, label: t(`light.${l}`) }))}
            onSelect={(v) => onChange({ light: v as LightTime | undefined })}
          />
        ) : null}

        <FilterMenu
          label={t("filters.sort")}
          anyLabel={t("filters.sortTrending")}
          value={params.sort === "trending" ? undefined : params.sort}
          options={[
            { value: "name", label: t("filters.sortName") },
            { value: "price", label: t("filters.sortPrice") },
          ]}
          onSelect={(v) => onChange({ sort: (v as ListingParams["sort"]) ?? "trending" })}
        />

        {hasActiveFilters(params) ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-sm font-semibold underline-offset-4 hover:underline"
          >
            <X aria-hidden className="size-4" />
            {t("filters.clear")}
          </button>
        ) : null}
      </div>

      <div
        role="group"
        aria-label={t("filters.view")}
        className="ml-auto flex shrink-0 rounded-full border-2 border-foreground/15 bg-card p-0.5"
      >
        {(["list", "map"] as const).map((view) => {
          const Icon = view === "list" ? List : MapIcon
          const active = params.view === view
          return (
            <button
              key={view}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ view })}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors",
                active ? "bg-foreground text-background" : "hover:bg-accent",
              )}
            >
              <Icon aria-hidden className="size-4" />
              {t(`filters.${view}`)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
