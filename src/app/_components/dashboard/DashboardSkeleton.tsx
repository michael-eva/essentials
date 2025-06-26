import { Skeleton } from "@/components/ui/skeleton"

export function UpcomingClassesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 border-gray-100">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="h-4 w-32 ml-auto" />
            <Skeleton className="h-8 w-28 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function WorkoutLoggingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      {[1, 2].map((i) => (
        <div key={i} className="flex flex-col bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex gap-3 mt-6 self-end">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ActivityHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 border-gray-100">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  )
}

export function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="overflow-hidden border border-brand-brown bg-brand-light-nude rounded-xl shadow-sm">
          <div className="px-4 py-4">
            <div className="flex flex-col gap-2">
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* Meta info row */}
              <div className="flex flex-wrap items-center gap-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Details row */}
              <div className="flex flex-wrap items-center gap-6 mt-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>

              {/* Achievements */}
              <div className="flex items-center gap-2 mt-1">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Notes section */}
            <div className="mt-3 flex items-center">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-48 ml-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 