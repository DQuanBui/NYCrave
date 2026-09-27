"use client"

import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export const ANY = "__any__"

type FilterMenuProps = {
  label: string
  anyLabel: string
  value: string | undefined
  options: { value: string; label: string }[]
  onSelect: (value: string | undefined) => void
}

/** A pill that opens a single-choice list. Filled when a value is chosen. */
export function FilterMenu({ label, anyLabel, value, options, onSelect }: FilterMenuProps) {
  const current = options.find((o) => o.value === value)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={pillClass(Boolean(current))}>
          <span className="sr-only">{label}: </span>
          {current?.label ?? label}
          <ChevronDown aria-hidden className="size-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 min-w-52 overflow-y-auto">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={value ?? ANY}
          onValueChange={(v) => onSelect(v === ANY ? undefined : v)}
        >
          <DropdownMenuRadioItem value={ANY}>{anyLabel}</DropdownMenuRadioItem>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function pillClass(active: boolean) {
  return cn(
    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border-2 px-3.5 text-sm font-semibold whitespace-nowrap transition-colors",
    active
      ? "border-foreground bg-foreground text-background"
      : "border-foreground/15 bg-card hover:border-foreground",
  )
}
