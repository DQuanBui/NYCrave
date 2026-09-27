"use client"

import { Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

type SmartSearchProps = {
  defaultValue?: string
  autoFocus?: boolean
  className?: string
}

export function SmartSearch({ defaultValue = "", autoFocus, className }: SmartSearchProps) {
  const t = useTranslations("search")
  const router = useRouter()
  const id = useId()
  const [query, setQuery] = useState(defaultValue)

  return (
    <form
      role="search"
      className={cn(
        "flex h-14 items-center gap-2 rounded-full border-2 border-foreground bg-card pr-1.5 pl-5 shadow-[4px_4px_0_0_var(--foreground)] transition-shadow focus-within:ring-4 focus-within:ring-taxi sm:h-16",
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault()
        const q = query.trim()
        if (q) router.push({ pathname: "/search", query: { q } })
      }}
    >
      <label htmlFor={id} className="sr-only">
        {t("label")}
      </label>
      <Search aria-hidden className="size-5 shrink-0 text-muted-foreground" />
      <input
        id={id}
        name="q"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("placeholder")}
        className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/80 focus-visible:outline-none sm:text-lg"
      />
      <button
        type="submit"
        className="h-11 shrink-0 rounded-full bg-taxi px-5 font-bold text-taxi-foreground transition-transform active:scale-95 sm:h-12 sm:px-6"
      >
        {t("submit")}
      </button>
    </form>
  )
}
