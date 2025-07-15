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
                  <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse"></div>
              </div>

              {/* Meta info row */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Details row */}
              <div className="flex flex-wrap items-center gap-6 mt-1">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Achievements */}
              <div className="flex items-center gap-2 mt-1">
                <div className="h-5 w-20 rounded bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Notes section */}
            <div className="mt-3 flex items-center">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse ml-1"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl shadow-xl border-brand-brown bg-white">
        <div className="px-6 py-6">
          <div className="space-y-2 mb-6">
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse"></div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="mt-2 space-y-1">
                      <div className="h-2 w-full bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PilatesVideosSkeleton() {
  return (
    <div className="flex flex-col gap-8 mb-8">
      {[1].map((i) => (
        <div key={i} className="border rounded-lg overflow-hidden shadow-sm bg-[#f9f7f3] p-0 w-full max-w-full">
          <div className="relative aspect-video w-full bg-gray-100 flex items-center justify-center" style={{ maxHeight: 190 }}>
            <div className="h-full w-full bg-gray-200 animate-pulse" />
            <span className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse" />
            </span>
          </div>
          <div className="p-4">
            <div className="h-5 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="flex gap-4 text-gray-700 text-sm mb-1">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-56 bg-gray-200 rounded mt-2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
} 