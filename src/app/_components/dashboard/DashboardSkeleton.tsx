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