"use client"

import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { AnimatePresence, useReducedMotion } from "motion/react"
import * as m from "motion/react-m"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Dialog } from "radix-ui"
import { useCallback, useRef, useState } from "react"
import { IllustrativeChip } from "@/components/place/place-photo"
import { cn } from "@/lib/utils"
import type { Photo } from "@/types/place"

function Credit({ photo, className }: { photo: Photo; className?: string }) {
  if (!photo.attribution) return null
  return (
    <span className={className}>
      {photo.attribution.url ? (
        <a
          href={photo.attribution.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {photo.attribution.text}
        </a>
      ) : (
        photo.attribution.text
      )}
    </span>
  )
}

/**
 * The place gallery: a swipeable strip, where any photo opens full screen.
 * In the viewer, swipe, use the arrow keys or the buttons to move between photos.
 */
export function PhotoLightbox({ photos, className }: { photos: Photo[]; className?: string }) {
  const t = useTranslations("place.gallery")
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [{ index, dir }, setView] = useState({ index: 0, dir: 0 })
  const start = useRef<number | null>(null)
  const thumbs = useRef<(HTMLButtonElement | null)[]>([])

  const go = useCallback(
    (step: number) =>
      setView((v) => ({ index: (v.index + step + photos.length) % photos.length, dir: step })),
    [photos.length],
  )
  const photo = photos[index]

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <ul
        className={cn(
          "relative scrollbar-none flex snap-x snap-mandatory gap-1 overflow-x-auto",
          className,
        )}
      >
        {photos.map((p, i) => (
          <li
            key={p.url}
            className={cn(
              "relative h-full shrink-0 snap-start overflow-hidden bg-muted",
              photos.length === 1 ? "w-full" : "w-[88%] sm:w-[60%] lg:w-[45%]",
            )}
          >
            <figure className="h-full">
              <Dialog.Trigger asChild>
                <button
                  ref={(el) => {
                    thumbs.current[i] = el
                  }}
                  type="button"
                  onClick={() => setView({ index: i, dir: 0 })}
                  aria-label={t("open", { n: i + 1, total: photos.length, alt: p.alt })}
                  className="group absolute inset-0 cursor-zoom-in"
                >
                  <Image
                    src={p.url}
                    alt={p.alt}
                    fill
                    preload={i === 0}
                    fetchPriority={i === 0 ? "high" : undefined}
                    sizes="(min-width: 1024px) 45vw, 90vw"
                    // Proxied Google photos are fetched per view and must not be re-hosted
                    unoptimized={p.source === "google_places"}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </button>
              </Dialog.Trigger>
              {p.illustrative ? <IllustrativeChip className="top-2 bottom-auto" /> : null}
              {p.attribution ? (
                <figcaption className="absolute right-0 bottom-0 rounded-tl-md bg-black/65 px-2 py-0.5 text-[0.7rem] text-white">
                  <Credit photo={p} />
                </figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/92 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex flex-col text-white outline-none"
          // Back on the page, land on the photo that was last on screen
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            thumbs.current[index]?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1)
            if (e.key === "ArrowLeft") go(-1)
          }}
        >
          <div className="flex items-center justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <Dialog.Title className="text-sm font-semibold tabular-nums">
              {t("count", { n: index + 1, total: photos.length })}
            </Dialog.Title>
            <Dialog.Close className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
              <X aria-hidden className="size-5" />
              <span className="sr-only">{t("close")}</span>
            </Dialog.Close>
          </div>

          <div
            className="relative flex-1 touch-pan-y overflow-hidden"
            onPointerDown={(e) => (start.current = e.clientX)}
            onPointerUp={(e) => {
              if (start.current === null) return
              const dx = e.clientX - start.current
              start.current = null
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
            }}
          >
            <AnimatePresence initial={false} custom={dir}>
              <m.div
                key={photo.url}
                custom={dir}
                className="absolute inset-4 sm:inset-10"
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -80 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes="100vw"
                  unoptimized={photo.source === "google_places"}
                  className="object-contain select-none"
                  draggable={false}
                />
              </m.div>
            </AnimatePresence>

            {photos.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute top-1/2 left-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20"
                >
                  <ChevronLeft aria-hidden className="size-6" />
                  <span className="sr-only">{t("previous")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute top-1/2 right-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20"
                >
                  <ChevronRight aria-hidden className="size-6" />
                  <span className="sr-only">{t("next")}</span>
                </button>
              </>
            ) : null}
          </div>

          <Dialog.Description asChild>
            <div className="space-y-1 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
              <p className="text-sm">{photo.alt}</p>
              <Credit photo={photo} className="text-xs text-white/70" />
            </div>
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
