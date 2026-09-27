import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function PlaceCardSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("overflow-hidden rounded-2xl border bg-card", className)}>
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
  )
}
